<?php
ob_start();
error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

function sendJsonResponse($data, $statusCode = 200) {
    ob_end_clean();
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_end_clean();
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro fatal no servidor',
            'debug' => "Erro em {$error['file']} linha {$error['line']}: {$error['message']}"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    sendJsonResponse([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'debug' => "Error in $errfile line $errline"
    ], 500);
});

try {
    require_once __DIR__ . '/../config/database.php';
} catch (Exception $e) {
    error_log("Erro ao carregar database.php: " . $e->getMessage());
    sendJsonResponse([
        'success' => false,
        'message' => 'Erro ao carregar configurações do banco de dados',
        'error' => $e->getMessage()
    ], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
error_log("[API] Request Method: $method");

try {
    $db = Database::getInstance()->getConnection();
    
    // Verificar se a tabela existe
    $tableCheck = $db->query("SHOW TABLES LIKE 'appointments'");
    if ($tableCheck->rowCount() === 0) {
        sendJsonResponse([
            'success' => false,
            'message' => 'A tabela appointments não existe no banco de dados',
            'action' => 'Execute o arquivo database/schema.sql no seu MySQL primeiro',
            'sql_file' => 'database/schema.sql'
        ], 500);
    }
    
} catch (Exception $e) {
    error_log("Erro de conexão: " . $e->getMessage());
    sendJsonResponse([
        'success' => false,
        'message' => 'Erro ao conectar ao banco de dados',
        'error' => $e->getMessage(),
        'hint' => 'Verifique se o MySQL está rodando e as credenciais em config/database.php estão corretas'
    ], 500);
}

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['check_date'])) {
                $date = $_GET['check_date'];
                
                // When employee confirms presence, status becomes 'confirmed' and blocks the slot
                // When employee unconfirms, status goes back to 'pending' and unblocks the slot
                $stmt = $db->prepare("
                    SELECT appointment_time 
                    FROM appointments 
                    WHERE appointment_date = ? 
                    AND status = 'confirmed'
                ");
                $stmt->execute([$date]);
                $appointments = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                sendJsonResponse([
                    'success' => true,
                    'blocked_slots' => $appointments
                ]);
            } elseif (isset($_GET['id'])) {
                $stmt = $db->prepare("SELECT a.*, e.name as confirmed_by_name FROM appointments a LEFT JOIN employees e ON a.contract_closed_by = e.id WHERE a.id = ?");
                $stmt->execute([$_GET['id']]);
                $appointment = $stmt->fetch();
                
                if ($appointment) {
                    sendJsonResponse(['success' => true, 'data' => $appointment]);
                } else {
                    sendJsonResponse(['success' => false, 'message' => 'Agendamento não encontrado'], 404);
                }
            } else {
                $status = $_GET['status'] ?? null;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $sql = "SELECT a.* FROM appointments a";
                $params = [];
                
                if ($status) {
                    $sql .= " WHERE a.status = ?";
                    $params[] = $status;
                }
                
                $sql .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?";
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $appointments = $stmt->fetchAll();
                
                sendJsonResponse(['success' => true, 'data' => $appointments]);
            }
            break;
            
        case 'POST':
            $rawInput = file_get_contents('php://input');
            error_log("[API] Raw input: " . $rawInput);
            
            $data = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'JSON inválido: ' . json_last_error_msg()
                ], 400);
            }
            
            error_log("[API] Decoded data: " . print_r($data, true));
            
            $required = ['name', 'email', 'phone', 'appointment_date', 'appointment_time'];
            $missing = [];
            foreach ($required as $field) {
                if (!isset($data[$field]) || trim($data[$field]) === '') {
                    $missing[] = $field;
                }
            }
            
            if (!empty($missing)) {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Campos obrigatórios ausentes: ' . implode(', ', $missing),
                    'received_data' => $data
                ], 400);
            }
            
            $date = DateTime::createFromFormat('Y-m-d', $data['appointment_date']);
            if (!$date || $date->format('Y-m-d') !== $data['appointment_date']) {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Formato de data inválido. Use YYYY-MM-DD'
                ], 400);
            }
            
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND appointment_time = ?");
            $stmt->execute([$data['appointment_date'], $data['appointment_time']]);
            $result = $stmt->fetch();
            
            if ($result['count'] > 0) {
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Este horário já está reservado. Por favor, escolha outro horário.'
                ], 409);
            }
            
            $stmt = $db->prepare("
                INSERT INTO appointments (
                    name, email, phone, appointment_date, appointment_day, 
                    appointment_time, message, status, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
            ");
            
            $result = $stmt->execute([
                trim($data['name']),
                trim($data['email']),
                trim($data['phone']),
                $data['appointment_date'],
                $data['appointment_day'] ?? '',
                $data['appointment_time'],
                $data['message'] ?? '',
                $data['notes'] ?? ''
            ]);
            
            if ($result) {
                $id = $db->lastInsertId();
                error_log("[API SUCCESS] Appointment created with ID: $id");
                sendJsonResponse([
                    'success' => true,
                    'message' => 'Agendamento criado com sucesso!',
                    'id' => $id
                ], 201);
            } else {
                $errorInfo = $stmt->errorInfo();
                error_log("[API ERROR] Insert failed: " . print_r($errorInfo, true));
                sendJsonResponse([
                    'success' => false,
                    'message' => 'Erro ao salvar agendamento',
                    'error' => $errorInfo[2]
                ], 500);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            error_log(file_get_contents('php://input'));
            
            if (empty($data['id'])) {
                sendJsonResponse(['success' => false, 'message' => 'ID é obrigatório'], 400);
            }
            
            $fields = [];
            $params = [];
            
            $allowedFields = ['status', 'confirmed_by', 'contract_closed_by', "contract_closed_at", 'name', 'email', 'phone', 'appointment_date', 'appointment_day', 'appointment_time', 'message', 'notes'];
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (empty($fields)) {
                sendJsonResponse(['success' => false, 'message' => 'Nenhum campo para atualizar'], 400);
            }
            
            if (isset($data['status']) && $data['status'] === 'confirmed') {
                $fields[] = "contract_closed_at = CURRENT_TIMESTAMP";
            }
            
            $params[] = $data['id'];
            
            $sql = "UPDATE appointments SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            sendJsonResponse(['success' => true, 'message' => 'Agendamento atualizado com sucesso']);
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                sendJsonResponse(['success' => false, 'message' => 'ID é obrigatório'], 400);
            }
            
            $stmt = $db->prepare("DELETE FROM appointments WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            sendJsonResponse(['success' => true, 'message' => 'Agendamento deletado com sucesso']);
            break;
            
        default:
            sendJsonResponse(['success' => false, 'message' => 'Método não permitido'], 405);
    }
} catch (PDOException $e) {
    error_log("[API ERROR] PDO Exception: " . $e->getMessage());
    sendJsonResponse([
        'success' => false,
        'message' => 'Erro no banco de dados',
        'error' => $e->getMessage()
    ], 500);
} catch (Exception $e) {
    error_log("[API ERROR] General Exception: " . $e->getMessage());
    sendJsonResponse([
        'success' => false,
        'message' => 'Erro inesperado no servidor',
        'error' => $e->getMessage()
    ], 500);
}
?>
