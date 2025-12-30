<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';
        
        switch ($action) {
            case 'login':
                $email = $data['email'] ?? '';
                $password = $data['password'] ?? '';
                
                if (empty($email) || empty($password)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios']);
                    exit;
                }
                
                $stmt = $db->prepare("SELECT id, name, email, password, role, status FROM employees WHERE email = ?");
                $stmt->execute([$email]);
                $employee = $stmt->fetch();
                
                if ($employee && password_verify($password, $employee['password'])) {
                    if ($employee['status'] !== 'active') {
                        http_response_code(403);
                        echo json_encode(['success' => false, 'message' => 'Conta inativa']);
                        exit;
                    }
                    
                    // Não retornar a senha
                    unset($employee['password']);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login realizado com sucesso',
                        'data' => $employee
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Email ou senha inválidos']);
                }
                break;
                
            case 'verify':
                // Verificar token/sessão (implementação simplificada)
                $employeeId = $data['employee_id'] ?? null;
                
                if (!$employeeId) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID do funcionário é obrigatório']);
                    exit;
                }
                
                $stmt = $db->prepare("SELECT id, name, email, role, status FROM employees WHERE id = ? AND status = 'active'");
                $stmt->execute([$employeeId]);
                $employee = $stmt->fetch();
                
                if ($employee) {
                    echo json_encode(['success' => true, 'data' => $employee]);
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Sessão inválida']);
                }
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Ação inválida']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
    error_log($e->getMessage());
}
