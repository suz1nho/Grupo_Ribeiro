<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

try {
    if ($method === 'POST') {
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON invalido: ' . json_last_error_msg()]);
            exit;
        }

        $action = $data['action'] ?? '';

        switch ($action) {
            // ─────────────────────────────────────────
            // LOGIN: Authenticate and return a Bearer token
            // ─────────────────────────────────────────
            case 'login':
                $email    = trim($data['email'] ?? '');
                $password = $data['password'] ?? '';

                if (empty($email) || empty($password)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Email e senha sao obrigatorios']);
                    exit;
                }

                // Authenticate employee
                $stmt = $db->prepare("SELECT id, name, email, password, role, status FROM employees WHERE email = ?");
                $stmt->execute([$email]);
                $employee = $stmt->fetch();

                if (!$employee || !password_verify($password, $employee['password'])) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Email ou senha invalidos']);
                    exit;
                }

                if ($employee['status'] !== 'active') {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'Conta inativa. Contate o administrador.']);
                    exit;
                }

                // Generate a secure token (64 hex chars = 256 bits)
                $token   = bin2hex(random_bytes(32));
                $expires = date('Y-m-d H:i:s', strtotime('+7 days'));
                $ip      = $_SERVER['REMOTE_ADDR'] ?? '';
                $ua      = $_SERVER['HTTP_USER_AGENT'] ?? '';
                $metadata = json_encode(['login_source' => 'api']);

                // Store token in the logins table
                $stmt = $db->prepare("
                    INSERT INTO logins (employee_id, token, expires_at, ip_address, user_agent, metadata, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'active')
                ");
                $stmt->execute([$employee['id'], $token, $expires, $ip, $ua, $metadata]);

                // Return token + employee data (without password)
                unset($employee['password']);
                $employee['api_token']  = $token;
                $employee['expires_at'] = $expires;

                echo json_encode([
                    'success' => true,
                    'message' => 'Login realizado com sucesso',
                    'data'    => $employee
                ], JSON_UNESCAPED_UNICODE);
                break;

            // ─────────────────────────────────────────
            // VERIFY: Validate the Bearer token from the Authorization header
            // ─────────────────────────────────────────
            case 'verify':
                // Use the existing authenticateToken() helper
                try {
                    $auth = authenticateToken();
                    echo json_encode([
                        'success' => true,
                        'data'    => [
                            'id'    => $auth['id'],
                            'name'  => $auth['name'],
                            'email' => $auth['email'],
                            'role'  => $auth['role'],
                        ]
                    ]);
                } catch (Exception $e) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Token invalido ou expirado']);
                }
                break;

            // ─────────────────────────────────────────
            // LOGOUT: Revoke the current Bearer token
            // ─────────────────────────────────────────
            case 'logout':
                // Extract token from Authorization header
                $headers = getallheaders();
                $authHeader = $headers['Authorization'] ?? '';
                if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Token nao fornecido']);
                    exit;
                }

                $token = $matches[1];
                $stmt = $db->prepare("
                    UPDATE logins
                    SET status = 'revoked', expires_at = NOW()
                    WHERE token = ? AND status = 'active'
                ");
                $stmt->execute([$token]);

                echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso']);
                break;

            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Acao invalida. Use: login, verify, logout']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metodo nao permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor']);
    error_log("[Auth API] " . $e->getMessage());
}
