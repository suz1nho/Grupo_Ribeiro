<?php
session_start();
require_once __DIR__ . '/../config/database.php';

// Remover sessão do banco de dados
if (isset($_SESSION['employee_id'])) {
    try {
        $db = Database::getInstance()->getConnection();
        $sessionId = session_id();
        $stmt = $db->prepare("DELETE FROM sessions WHERE id = ?");
        $stmt->execute([$sessionId]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
    }
}

// Destruir sessão
session_destroy();

// Redirecionar para login
header('Location: index.php');
exit;
