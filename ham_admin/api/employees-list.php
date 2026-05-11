<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT id, name, role, email FROM employees WHERE status = 'active' ORDER BY name ASC");
    $employees = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $employees]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro no servidor']);
}
