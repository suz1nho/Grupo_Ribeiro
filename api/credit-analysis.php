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
            if (isset($_GET['action']) && $_GET['action'] === 'employees') {
                // Buscar lista de funcionários ativos
                $stmt = $db->prepare("SELECT id, name, email, role FROM employees WHERE status = 'active' ORDER BY name ASC");
                $stmt->execute();
                $employees = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $employees]);
            } elseif (isset($_GET['id'])) {
                $stmt = $db->prepare("
                    SELECT ca.*, e.name as confirmed_by_name 
                    FROM credit_analysis ca 
                    LEFT JOIN employees e ON ca.analyzed_by = e.id 
                    WHERE ca.id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $analysis = $stmt->fetch();
                
                if ($analysis) {
                    echo json_encode(['success' => true, 'data' => $analysis]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Análise não encontrada']);
                }
            } else {
                $status = $_GET['status'] ?? null;
                $limit = $_GET['limit'] ?? 100;
                $offset = $_GET['offset'] ?? 0;
                
                $sql = "SELECT ca.*, e.name as confirmed_by_name 
                        FROM credit_analysis ca 
                        LEFT JOIN employees e ON ca.analyzed_by = e.id";
                $params = [];
                
                if ($status) {
                    $sql .= " WHERE ca.status = ?";
                    $params[] = $status;
                }
                
                $sql .= " ORDER BY ca.created_at DESC LIMIT ? OFFSET ?";
                $params[] = (int)$limit;
                $params[] = (int)$offset;
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $analyses = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'data' => $analyses]);
            }
            break;
            
        case 'POST':
            // Criar nova análise de crédito
            $telefone = $_POST['telefone'] ?? '';
            $nome = $_POST['nome'] ?? '';
            $email = $_POST['email'] ?? '';
            
            if (empty($telefone)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Telefone é obrigatório']);
                exit;
            }
            
            if (empty($nome)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nome é obrigatório']);
                exit;
            }
            
            if (empty($email)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email é obrigatório']);
                exit;
            }
            
            // Processar uploads de documentos
            $uploadDir = __DIR__ . '/../uploads/credit-analysis/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $docIdentidade = null;
            $docEndereco = null;
            $docRenda = null;
            $docBancario = null;
            
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            $maxSize = 5 * 1024 * 1024; // 5MB
            
            // Upload doc_identidade
            if (isset($_FILES['doc_identidade']) && $_FILES['doc_identidade']['error'] === UPLOAD_ERR_OK) {
                if (!in_array($_FILES['doc_identidade']['type'], $allowedTypes)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Tipo de arquivo inválido para documento de identidade']);
                    exit;
                }
                if ($_FILES['doc_identidade']['size'] > $maxSize) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Arquivo de identidade muito grande']);
                    exit;
                }
                $ext = pathinfo($_FILES['doc_identidade']['name'], PATHINFO_EXTENSION);
                $filename = uniqid() . '_' . time() . '.' . $ext;
                $filepath = $uploadDir . $filename;
                if (move_uploaded_file($_FILES['doc_identidade']['tmp_name'], $filepath)) {
                    $docIdentidade = $filename;
                }
            }
            
            // Upload doc_endereco
            if (isset($_FILES['doc_endereco']) && $_FILES['doc_endereco']['error'] === UPLOAD_ERR_OK) {
                if (!in_array($_FILES['doc_endereco']['type'], $allowedTypes)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Tipo de arquivo inválido para comprovante de endereço']);
                    exit;
                }
                if ($_FILES['doc_endereco']['size'] > $maxSize) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Arquivo de endereço muito grande']);
                    exit;
                }
                $ext = pathinfo($_FILES['doc_endereco']['name'], PATHINFO_EXTENSION);
                $filename = uniqid() . '_' . time() . '.' . $ext;
                $filepath = $uploadDir . $filename;
                if (move_uploaded_file($_FILES['doc_endereco']['tmp_name'], $filepath)) {
                    $docEndereco = $filename;
                }
            }
            
            // Upload doc_renda
            if (isset($_FILES['doc_renda']) && $_FILES['doc_renda']['error'] === UPLOAD_ERR_OK) {
                if (!in_array($_FILES['doc_renda']['type'], $allowedTypes)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Tipo de arquivo inválido para comprovante de renda']);
                    exit;
                }
                if ($_FILES['doc_renda']['size'] > $maxSize) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Arquivo de renda muito grande']);
                    exit;
                }
                $ext = pathinfo($_FILES['doc_renda']['name'], PATHINFO_EXTENSION);
                $filename = uniqid() . '_' . time() . '.' . $ext;
                $filepath = $uploadDir . $filename;
                if (move_uploaded_file($_FILES['doc_renda']['tmp_name'], $filepath)) {
                    $docRenda = $filename;
                }
            }
            
            // Upload doc_bancario
            if (isset($_FILES['doc_bancario']) && $_FILES['doc_bancario']['error'] === UPLOAD_ERR_OK) {
                if (!in_array($_FILES['doc_bancario']['type'], $allowedTypes)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Tipo de arquivo inválido para extrato bancário']);
                    exit;
                }
                if ($_FILES['doc_bancario']['size'] > $maxSize) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Arquivo bancário muito grande']);
                    exit;
                }
                $ext = pathinfo($_FILES['doc_bancario']['name'], PATHINFO_EXTENSION);
                $filename = uniqid() . '_' . time() . '.' . $ext;
                $filepath = $uploadDir . $filename;
                if (move_uploaded_file($_FILES['doc_bancario']['tmp_name'], $filepath)) {
                    $docBancario = $filename;
                }
            }
            
            $stmt = $db->prepare("
                INSERT INTO credit_analysis (name, email, phone, doc_identidade, doc_endereco, doc_renda, doc_bancario, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
            ");
            
            $stmt->execute([
                $nome,
                $email,
                $telefone,
                $docIdentidade,
                $docEndereco,
                $docRenda,
                $docBancario
            ]);
            
            $id = $db->lastInsertId();
            
            echo json_encode(['success' => true, 'message' => 'Análise de crédito enviada com sucesso', 'id' => $id]);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            error_log(file_get_contents('php://input'));
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID é obrigatório']);
                exit;
            }
            
            $fields = [];
            $params = [];
            
            $allowedFields = ['status', 'analyzed_by', 'score', 'notes'];
            
            if (isset($data['confirmed_by'])) {
                $data['analyzed_by'] = $data['confirmed_by'];
                unset($data['confirmed_by']);
            }
            
            if (isset($data['analysis_status'])) {
                $data['status'] = $data['analysis_status'];
                unset($data['analysis_status']);
            }
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (isset($data['analyzed_by']) && $data['analyzed_by'] !== null) {
                $fields[] = "analyzed_at = NOW()";
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar']);
                exit;
            }
            
            $params[] = $data['id'];
            
            $sql = "UPDATE credit_analysis SET " . implode(', ', $fields) . " WHERE id = ?";
            
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Análise atualizada com sucesso']);
            break;
            
        case 'DELETE':
            // Deletar análise
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID é obrigatório']);
                exit;
            }
            
            // Buscar arquivos para deletar
            $stmt = $db->prepare("SELECT doc_identidade, doc_endereco, doc_renda, doc_bancario FROM credit_analysis WHERE id = ?");
            $stmt->execute([$data['id']]);
            $analysis = $stmt->fetch();
            
            if ($analysis) {
                $uploadDir = __DIR__ . '/../uploads/credit-analysis/';
                foreach (['doc_identidade', 'doc_endereco', 'doc_renda', 'doc_bancario'] as $field) {
                    if ($analysis[$field] && file_exists($uploadDir . $analysis[$field])) {
                        unlink($uploadDir . $analysis[$field]);
                    }
                }
            }
            
            $stmt = $db->prepare("DELETE FROM credit_analysis WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Análise deletada com sucesso']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    error_log("[v0] PDO Exception: " . $e->getMessage());
    error_log("[v0] Stack trace: " . $e->getTraceAsString());
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
}
