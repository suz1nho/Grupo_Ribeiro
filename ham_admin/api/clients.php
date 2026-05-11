<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $stmt = $db->prepare("
                    SELECT c.*, e.name as registered_by_name 
                    FROM clients c 
                    LEFT JOIN employees e ON c.client_registered_by = e.id 
                    WHERE c.client_id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $client = $stmt->fetch();
                if ($client) {
                    echo json_encode(['success' => true, 'data' => $client]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Cliente não encontrado']);
                }
            } else {
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $sql = "SELECT c.*, e.name as registered_by_name 
                        FROM clients c 
                        LEFT JOIN employees e ON c.client_registered_by = e.id 
                        ORDER BY c.registered_at DESC 
                        LIMIT ? OFFSET ?";
                $stmt = $db->prepare($sql);
                $stmt->execute([$limit, $offset]);
                $clients = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $clients, 'total' => count($clients)]);
            }
            break;
            
        case 'POST':
            // Support both JSON and form-data
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);
            
            if ($data && is_array($data)) {
                $name = trim($data['name'] ?? '');
                $email = trim($data['email'] ?? '');
                $phone = trim($data['phone'] ?? '');
                $cpf = preg_replace('/\D/', '', $data['cpf'] ?? '');
                $description = trim($data['description'] ?? '');
            } else {
                $name = trim($_POST['name'] ?? '');
                $email = trim($_POST['email'] ?? '');
                $phone = trim($_POST['phone'] ?? '');
                $cpf = preg_replace('/\D/', '', $_POST['cpf'] ?? '');
                $description = trim($_POST['description'] ?? '');
            }
            
            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nome é obrigatório']);
                exit;
            }
            
            session_start();
            $employeeId = $_SESSION['employee_id'] ?? null;
            
            $stmt = $db->prepare("INSERT INTO clients (name, email, phone, cpf, description, status, client_registered_by) VALUES (?, ?, ?, ?, ?, 'active', ?)");
            $stmt->execute([$name, $email, $phone, $cpf, $description, $employeeId]);
            $clientId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Cliente cadastrado com sucesso!', 
                'client_id' => $clientId,
                'client' => [
                    'client_id' => $clientId,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'cpf' => $cpf,
                    'description' => $description,
                    'status' => 'active',
                    'client_registered_by' => $employeeId
                ]
            ]);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['client_id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID do cliente é obrigatório']);
                exit;
            }
            
            $fields = [];
            $params = [];
            $allowedFields = ['name', 'email', 'phone', 'cpf', 'description', 'status'];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar']);
                exit;
            }
            
            $params[] = $data['client_id'];
            $sql = "UPDATE clients SET " . implode(', ', $fields) . " WHERE client_id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Cliente atualizado com sucesso']);
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['client_id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID do cliente é obrigatório']);
                exit;
            }
            
            $stmt = $db->prepare("DELETE FROM clients WHERE client_id = ?");
            $stmt->execute([$data['client_id']]);
            
            echo json_encode(['success' => true, 'message' => 'Cliente deletado com sucesso']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    error_log("[v0] PDO Exception: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
}
