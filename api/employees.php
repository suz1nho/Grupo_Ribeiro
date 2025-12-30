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
                // Buscar funcionário específico
                $stmt = $db->prepare("SELECT id, name, email, role, cpf, phone, hired_date, birth_date, address, emergency_contact, status, created_at FROM employees WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $employee = $stmt->fetch();
                
                if ($employee) {
                    // Format CPF for display
                    if ($employee['cpf']) {
                        $employee['cpf'] = preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', preg_replace('/\D/', '', $employee['cpf']));
                    }
                    // Format phone for display
                    if ($employee['phone']) {
                        $phone = preg_replace('/\D/', '', $employee['phone']);
                        if (strlen($phone) === 11) {
                            $employee['phone'] = preg_replace('/(\d{2})(\d{5})(\d{4})/', '($1) $2-$3', $phone);
                        } else if (strlen($phone) === 10) {
                            $employee['phone'] = preg_replace('/(\d{2})(\d{4})(\d{4})/', '($1) $2-$3', $phone);
                        }
                    }
                    echo json_encode(['success' => true, 'employee' => $employee]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Funcionário não encontrado']);
                }
            } else {
                // Buscar todos os funcionários
                $status = $_GET['status'] ?? null;
                $role = $_GET['role'] ?? null;
                
                $sql = "SELECT id, name, email, role, cpf, phone, hired_date, birth_date, address, emergency_contact, status, created_at FROM employees WHERE 1=1";
                $params = [];
                
                if ($status) {
                    $sql .= " AND status = ?";
                    $params[] = $status;
                }
                
                if ($role) {
                    $sql .= " AND role = ?";
                    $params[] = $role;
                }
                
                $sql .= " ORDER BY name ASC";
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $employees = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'data' => $employees]);
            }
            break;
            
        case 'POST':
            // Criar novo funcionário
            $data = json_decode(file_get_contents('php://input'), true);
            
            $required = ['name', 'email', 'password', 'cpf'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => "Campo obrigatório: $field"]);
                    exit;
                }
            }
            
            // Verificar se email já existe
            $stmt = $db->prepare("SELECT id FROM employees WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email já cadastrado']);
                exit;
            }
            
            // Verificar se CPF já existe
            $stmt = $db->prepare("SELECT id FROM employees WHERE cpf = ?");
            $stmt->execute([$data['cpf']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'CPF já cadastrado']);
                exit;
            }
            
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            
            $stmt = $db->prepare("
                INSERT INTO employees (name, email, password, cpf, phone, role, hired_date, birth_date, address, emergency_contact, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['name'],
                $data['email'],
                $hashedPassword,
                $data['cpf'],
                $data['phone'] ?? null,
                $data['role'] ?? 'employee',
                $data['hired_date'] ?? date('Y-m-d'),
                $data['birth_date'] ?? null,
                $data['address'] ?? null,
                $data['emergency_contact'] ?? null,
                $data['status'] ?? 'active'
            ]);
            
            $id = $db->lastInsertId();
            
            echo json_encode(['success' => true, 'message' => 'Funcionário cadastrado com sucesso', 'id' => $id]);
            break;
            
        case 'PUT':
            // Atualizar funcionário
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID é obrigatório']);
                exit;
            }
            
            $fields = [];
            $params = [];
            
            $allowedFields = ['name', 'email', 'cpf', 'phone', 'role', 'hired_date', 'birth_date', 'address', 'emergency_contact', 'status'];
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    // Verificar unicidade de email
                    if ($field === 'email') {
                        $stmt = $db->prepare("SELECT id FROM employees WHERE email = ? AND id != ?");
                        $stmt->execute([$data[$field], $data['id']]);
                        if ($stmt->fetch()) {
                            http_response_code(400);
                            echo json_encode(['success' => false, 'message' => 'Email já cadastrado']);
                            exit;
                        }
                    }
                    
                    // Verificar unicidade de CPF
                    if ($field === 'cpf') {
                        $stmt = $db->prepare("SELECT id FROM employees WHERE cpf = ? AND id != ?");
                        $stmt->execute([$data[$field], $data['id']]);
                        if ($stmt->fetch()) {
                            http_response_code(400);
                            echo json_encode(['success' => false, 'message' => 'CPF já cadastrado']);
                            exit;
                        }
                    }
                    
                    $fields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            // Atualizar senha se fornecida
            if (!empty($data['password'])) {
                $fields[] = "password = ?";
                $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar']);
                exit;
            }
            
            $params[] = $data['id'];
            
            $sql = "UPDATE employees SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Funcionário atualizado com sucesso']);
            break;
            
        case 'DELETE':
            // Deletar funcionário
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID é obrigatório']);
                exit;
            }
            
            $stmt = $db->prepare("DELETE FROM employees WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Funcionário deletado com sucesso']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Erro no servidor: $e", 'error' => $e->getMessage()]);
    error_log($e->getMessage());
}
