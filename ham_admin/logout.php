<?php
session_start();
require_once __DIR__ . '/../config/database.php';

// Support token-based logout (used by API clients)
$token = $_GET['token'] ?? $_POST['token'] ?? '';

if ($token) {
    // Revoke by token provided in request
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE logins SET status = 'revoked', expires_at = NOW() WHERE token = ? AND status = 'active'");
        $stmt->execute([$token]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
    }
} elseif (isset($_SESSION['employee_id'], $_SESSION['api_token'])) {
    // Revoke the token in the logins table using session data
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE logins SET status = 'revoked', expires_at = NOW() WHERE employee_id = ? AND token = ? AND status = 'active'");
        $stmt->execute([$_SESSION['employee_id'], $_SESSION['api_token']]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
    }
}

// Destroy session
session_destroy();

// Clear session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Redirect to login
header('Location: index.php');
exit;
