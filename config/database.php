<?php
// =============================
// Configuração do Banco
// =============================
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'grupo_ribeiro');
define('DB_USER', 'root');
define('DB_PASS', '1234');
define('DB_CHARSET', 'utf8mb4');

// =============================
// Configurações da Aplicação
// =============================
define('BASE_URL', 'http://localhost/grupo-ribeiro');
define('SITE_NAME', 'Grupo Ribeiro');

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
