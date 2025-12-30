<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance()->getConnection();

try {
    if ($method === 'GET') {
        $stats = [];
        
        // Total de agendamentos
        $stmt = $db->query("SELECT COUNT(*) as total FROM appointments");
        $stats['total_appointments'] = $stmt->fetch()['total'];
        
        // Agendamentos pendentes
        $stmt = $db->query("SELECT COUNT(*) as total FROM appointments WHERE status = 'pending'");
        $stats['pending_appointments'] = $stmt->fetch()['total'];
        
        // Agendamentos confirmados
        $stmt = $db->query("SELECT COUNT(*) as total FROM appointments WHERE status = 'confirmed'");
        $stats['confirmed_appointments'] = $stmt->fetch()['total'];
        
        // Agendamentos cancelados
        $stmt = $db->query("SELECT COUNT(*) as total FROM appointments WHERE status = 'cancelled'");
        $stats['cancelled_appointments'] = $stmt->fetch()['total'];
        
        // Taxa de confirmação
        if ($stats['total_appointments'] > 0) {
            $stats['confirmation_rate'] = round(($stats['confirmed_appointments'] / $stats['total_appointments']) * 100, 2);
        } else {
            $stats['confirmation_rate'] = 0;
        }
        
        // Total de contatos
        $stmt = $db->query("SELECT COUNT(*) as total FROM contacts");
        $stats['total_contacts'] = $stmt->fetch()['total'];
        
        // Contatos novos
        $stmt = $db->query("SELECT COUNT(*) as total FROM contacts WHERE status = 'new'");
        $stats['new_contacts'] = $stmt->fetch()['total'];
        
        // Análises de crédito
        $stmt = $db->query("SELECT COUNT(*) as total FROM credit_analysis");
        $stats['total_credit_analysis'] = $stmt->fetch()['total'];
        
        // Análises pendentes
        $stmt = $db->query("SELECT COUNT(*) as total FROM credit_analysis WHERE status = 'pendente'");
        $stats['pending_credit_analysis'] = $stmt->fetch()['total'];
        
        // Análises aprovadas
        $stmt = $db->query("SELECT COUNT(*) as total FROM credit_analysis WHERE status = 'aprovado'");
        $stats['approved_credit_analysis'] = $stmt->fetch()['total'];
        
        // Total de funcionários
        $stmt = $db->query("SELECT COUNT(*) as total FROM employees WHERE status = 'active'");
        $stats['total_employees'] = $stmt->fetch()['total'];
        
        // Ranking de funcionários (por agendamentos confirmados)
        $stmt = $db->query("
            SELECT 
                e.id,
                e.name,
                COUNT(a.id) as total_confirmations,
                SUM(CASE WHEN a.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM employees e
            LEFT JOIN appointments a ON e.id = a.confirmed_by
            WHERE e.status = 'active'
            GROUP BY e.id, e.name
            ORDER BY confirmed DESC, total_confirmations DESC
            LIMIT 10
        ");
        $stats['employee_ranking'] = $stmt->fetchAll();
        
        // Agendamentos por mês (últimos 6 meses)
        $stmt = $db->query("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM appointments
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ");
        $stats['appointments_by_month'] = $stmt->fetchAll();
        
        // Agendamentos de hoje
        $stmt = $db->query("
            SELECT COUNT(*) as total 
            FROM appointments 
            WHERE DATE(appointment_date) = CURDATE()
        ");
        $stats['today_appointments'] = $stmt->fetch()['total'];
        
        // Agendamentos desta semana
        $stmt = $db->query("
            SELECT COUNT(*) as total 
            FROM appointments 
            WHERE WEEK(appointment_date) = WEEK(CURDATE()) 
            AND YEAR(appointment_date) = YEAR(CURDATE())
        ");
        $stats['week_appointments'] = $stmt->fetch()['total'];
        
        echo json_encode(['success' => true, 'data' => $stats]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
    error_log($e->getMessage());
}
