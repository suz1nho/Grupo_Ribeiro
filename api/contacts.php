<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Buscar contato específico
                $stmt = $db->prepare("SELECT * FROM contacts WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $contact = $stmt->fetch();
                
                if ($contact) {
                    echo json_encode(['success' => true, 'data' => $contact]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Contato não encontrado']);
                }
            } else {
                // Buscar todos os contatos
                $status = $_GET['status'] ?? null;
                $limit = $_GET['limit'] ?? 100;
                $offset = $_GET['offset'] ?? 0;
                
                $sql = "SELECT * FROM contacts";
                $params = [];
                
                if ($status) {
                    $sql .= " WHERE status = ?";
                    $params[] = $status;
                }
                
                $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
                $params[] = (int)$limit;
                $params[] = (int)$offset;
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $contacts = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'data' => $contacts]);
            }
            break;
            
        case 'POST':
            // Criar novo contato
            $data = json_decode(file_get_contents('php://input'), true);
            
            $required = ['name', 'email', 'phone', 'message'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => "Campo obrigatório: $field"]);
                    exit;
                }
            }
            
            $stmt = $db->prepare("
                INSERT INTO contacts (name, email, phone, message, status)
                VALUES (?, ?, ?, ?, 'new')
            ");
            
            $stmt->execute([
                $data['name'],
                $data['email'],
                $data['phone'],
                $data['message']
            ]);
            
            $id = $db->lastInsertId();
            
            echo json_encode(['success' => true, 'message' => 'Contato registrado com sucesso', 'id' => $id]);
            break;
            
        case 'PUT':
            // Atualizar contato
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID é obrigatório']);
                exit;
            }
            
            $fields = [];
            $params = [];
            
            $allowedFields = ['status', 'name', 'email', 'phone', 'message'];
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
            
            $params[] = $data['id'];
            
            $sql = "UPDATE contacts SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Contato atualizado com sucesso']);
            break;
            
        case 'DELETE':
            // Deletar contato
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID é obrigatório']);
                exit;
            }
            
            $stmt = $db->prepare("DELETE FROM contacts WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Contato deletado com sucesso']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
    error_log($e->getMessage());
}
