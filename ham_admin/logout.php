<?php
session_start();
require_once __DIR__ . '/../config/database.php';

// Revoke the token in the logins table
if (isset($_SESSION['employee_id'], $_SESSION['api_token'])) {
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE logins SET status = 'revoked', expires_at = NOW() WHERE employee_id = ? AND token = ? AND status = 'active'");
        $stmt->execute([$_SESSION['employee_id'], $_SESSION['api_token']]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
    }
}

// Destruir sessão
session_destroy();

// Redirecionar para login
header('Location: index.php');
exit;
