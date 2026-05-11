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
    require_once __DIR__ . '/../../config/database.php';
} catch (Exception $e) {
    error_log("Erro ao carregar database.php: " . $e->getMessage());
    sendJsonResponse([
        'success' => false,
        'message' => 'Erro ao carregar configurações do banco de dados',
        'error' => $e->getMessage()
    ], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = Database::getInstance()->getConnection();
    
    $tableCheck = $db->query("SHOW TABLES LIKE 'appointments'");
    if ($tableCheck->rowCount() === 0) {
        sendJsonResponse([
            'success' => false,
            'message' => 'A tabela appointments não existe no banco de dados',
            'action' => 'Execute o arquivo sql.sql no seu MySQL primeiro'
        ], 500);
    }
} catch (Exception $e) {
    error_log("Erro de conexão: " . $e->getMessage());
    sendJsonResponse([
        'success' => false,
        'message' => 'Erro ao conectar ao banco de dados',
        'error' => $e->getMessage()
    ], 500);
}

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['check_date'])) {
                $date = $_GET['check_date'];
                $stmt = $db->prepare("SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status = 'confirmed'");
                $stmt->execute([$date]);
                $appointments = $stmt->fetchAll(PDO::FETCH_COLUMN);
                sendJsonResponse(['success' => true, 'blocked_slots' => $appointments]);
            } 
            elseif (isset($_GET['id'])) {
                $stmt = $db->prepare("SELECT a.*, e.name as confirmed_by_name FROM appointments a LEFT JOIN employees e ON a.confirmed_by = e.id WHERE a.id = ?");
                $stmt->execute([$_GET['id']]);
                $appointment = $stmt->fetch();
                if ($appointment) {
                    sendJsonResponse(['success' => true, 'data' => $appointment]);
                } else {
                    sendJsonResponse(['success' => false, 'message' => 'Agendamento não encontrado'], 404);
                }
            } 
            else {
                $status = $_GET['status'] ?? null;
                $type = $_GET['type'] ?? null;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                if ($type === 'active') {
                    $sql = "SELECT a.*, e.name AS confirmed_by_name FROM appointments a LEFT JOIN employees e ON a.confirmed_by = e.id WHERE a.status IS NULL OR a.status IN ('pending','confirmed','approved') ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?";
                    $params = [$limit, $offset];
                } elseif ($type === 'closed') {
                    $sql = "SELECT a.*, e.name AS contract_closed_by_name FROM appointments a LEFT JOIN employees e ON a.contract_closed_by = e.id WHERE a.status = 'closed' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?";
                    $params = [$limit, $offset];
                } else {
                    $sql = "SELECT a.* FROM appointments a";
                    $params = [];
                    if ($status) {
                        $sql .= " WHERE a.status = ?";
                        $params[] = $status;
                    }
                    $sql .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?";
                    $params[] = $limit;
                    $params[] = $offset;
                }
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $appointments = $stmt->fetchAll();
                sendJsonResponse(['success' => true, 'data' => $appointments]);
            }
            break;
            
        case 'POST':
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                sendJsonResponse(['success' => false, 'message' => 'JSON inválido: ' . json_last_error_msg()], 400);
            }
            
            $required = ['name', 'email', 'phone', 'appointment_date', 'appointment_time'];
            $missing = [];
            foreach ($required as $field) {
                if (!isset($data[$field]) || trim($data[$field]) === '') {
                    $missing[] = $field;
                }
            }
            if (!empty($missing)) {
                sendJsonResponse(['success' => false, 'message' => 'Campos obrigatórios: ' . implode(', ', $missing)], 400);
            }
            
            $date = DateTime::createFromFormat('Y-m-d', $data['appointment_date']);
            if (!$date || $date->format('Y-m-d') !== $data['appointment_date']) {
                sendJsonResponse(['success' => false, 'message' => 'Formato de data inválido. Use YYYY-MM-DD'], 400);
            }
            
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND appointment_time = ?");
            $stmt->execute([$data['appointment_date'], $data['appointment_time']]);
            $result = $stmt->fetch();
            if ($result['count'] > 0) {
                sendJsonResponse(['success' => false, 'message' => 'Este horário já está reservado.'], 409);
            }
            
            $stmt = $db->prepare("INSERT INTO appointments (name, email, phone, appointment_date, appointment_day, appointment_time, message, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)");
            $stmt->execute([
                trim($data['name']),
                trim($data['email']),
                trim($data['phone']),
                $data['appointment_date'],
                $data['appointment_day'] ?? '',
                $data['appointment_time'],
                $data['message'] ?? '',
                $data['notes'] ?? ''
            ]);
            $id = $db->lastInsertId();
            sendJsonResponse(['success' => true, 'message' => 'Agendamento criado com sucesso!', 'id' => $id], 201);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['id'])) {
                sendJsonResponse(['success' => false, 'message' => 'ID é obrigatório'], 400);
            }
            
            $fields = [];
            $params = [];
            // employee_message is now a writable field
            $allowedFields = ['status', 'confirmed_by', 'contract_closed_by', 'contract_closed_at', 'name', 'email', 'phone', 'appointment_date', 'appointment_day', 'appointment_time', 'message', 'notes', 'employee_message'];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (isset($data['status']) && $data['status'] === 'closed' && !isset($data['contract_closed_at'])) {
                $fields[] = "contract_closed_at = CURRENT_TIMESTAMP";
            }
            
            if (isset($data['status']) && $data['status'] === 'pending' && array_key_exists('confirmed_by', $data) && $data['confirmed_by'] === null) {
                if (!in_array('confirmed_by = ?', $fields)) {
                    $fields[] = "confirmed_by = NULL";
                }
            }
            
            if (empty($fields)) {
                sendJsonResponse(['success' => false, 'message' => 'Nenhum campo para atualizar'], 400);
            }
            
            $params[] = $data['id'];
            $sql = "UPDATE appointments SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            if (isset($data['status']) && $data['status'] === 'closed') {
                try {
                    $stmtFetch = $db->prepare("SELECT name, email, phone, contract_closed_by FROM appointments WHERE id = ?");
                    $stmtFetch->execute([$data['id']]);
                    $appointment = $stmtFetch->fetch();
                    if ($appointment) {
                        $employeeId = $appointment['contract_closed_by'];
                        $stmtCheck = $db->prepare("SELECT client_id FROM clients WHERE email = ?");
                        $stmtCheck->execute([$appointment['email']]);
                        $existingClient = $stmtCheck->fetch();
                        if (!$existingClient) {
                            $stmtInsert = $db->prepare("INSERT INTO clients (name, email, phone, description, status, client_registered_by) VALUES (?, ?, ?, 'Contrato fechado.', 'active', ?)");
                            $stmtInsert->execute([$appointment['name'], $appointment['email'], $appointment['phone'], $employeeId]);
                        }
                    }
                } catch (PDOException $e) {
                    error_log("[CLIENT COPY ERROR] " . $e->getMessage());
                }
            }
            
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
    sendJsonResponse(['success' => false, 'message' => 'Erro no banco de dados', 'error' => $e->getMessage()], 500);
} catch (Exception $e) {
    error_log("[API ERROR] General Exception: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'message' => 'Erro inesperado no servidor', 'error' => $e->getMessage()], 500);
}
