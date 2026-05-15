<?php
// =============================
// Configuração do Banco (via environment variables)
// =============================

// Load .env file manually if exists
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        putenv(trim($line));
    }
}

define('DB_HOST', getenv('DB_HOST') ?: '');
define('DB_NAME', getenv('DB_NAME') ?: '');
define('DB_USER', getenv('DB_USER') ?: '');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', getenv('DB_CHARSET') ?: 'utf8mb4');

// =============================
// Configurações da Aplicação
// =============================
define('BASE_URL', getenv('BASE_URL') ?: 'http://localhost/');
define('SITE_NAME', getenv('SITE_NAME') ?: 'Grupo Ribeiro');

// Timezone
date_default_timezone_set('America/Sao_Paulo');

error_reporting(E_ALL);
ini_set('display_errors', 0); // Desabilitar exibição de erros
ini_set('log_errors', 1); // Habilitar log de erros
ini_set('error_log', __DIR__ . '/../logs/php_errors.log'); // Arquivo de log

// =============================
// Conexão com o Banco (PDO)
// =============================
class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("ERRO DE CONEXÃO: " . $e->getMessage());
            throw new Exception("Não foi possível conectar ao banco de dados. Verifique as configurações.");
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}

// =============================
// Token Authentication Helper
// =============================
/**
 * Authenticate the request using Bearer token from the logins table.
 * Returns employee data (id, name, email, role) or exits with 401.
 */
function authenticateToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Token não fornecido']);
        exit;
    }

    $token = $matches[1];
    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("
        SELECT l.employee_id, e.name AS employee_name, e.email AS employee_email, e.role AS employee_role
        FROM logins l
        JOIN employees e ON l.employee_id = e.id
        WHERE l.token = ?
          AND l.status = 'active'
          AND l.expires_at > NOW()
          AND e.status = 'active'
        LIMIT 1
    ");
    $stmt->execute([$token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Token inválido ou expirado']);
        exit;
    }

    return [
        'id'    => $row['employee_id'],
        'name'  => $row['employee_name'],
        'email' => $row['employee_email'],
        'role'  => $row['employee_role'],
    ];
}

/**
 * Require authentication. If token is valid, returns employee data.
 * If the request has no token and the method is one of the allowed public methods, it returns null.
 */
function requireAuth($allowPublicMethods = []) {
    $method = $_SERVER['REQUEST_METHOD'];
    if (in_array($method, $allowPublicMethods)) {
        // Try to authenticate if token provided, but don't block if missing
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            try {
                return authenticateToken();
            } catch (Exception $e) {
                // Token invalid, but method is public, so continue without auth
                return null;
            }
        }
        return null;
    } else {
        return authenticateToken();
    }
}
