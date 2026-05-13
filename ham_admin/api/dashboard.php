<?php
session_start();
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if (!isset($_SESSION['employee_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $db = Database::getInstance()->getConnection();
    $employeeId = $_SESSION['employee_id'];
    $employeeRole = $_SESSION['employee_role'] ?? '';

    // --- Monthly boundaries (first and last day of current month) ---
    $firstDayOfMonth = date('Y-m-01');
    $lastDayOfMonth  = date('Y-m-t');
    // Build month name manually (avoid deprecated strftime)
    $monthNumber = (int)date('m');
    $yearNumber  = date('Y');
    $monthNames = [
        1 => 'Janeiro', 2 => 'Fevereiro', 3 => 'Marco', 4 => 'Abril',
        5 => 'Maio', 6 => 'Junho', 7 => 'Julho', 8 => 'Agosto',
        9 => 'Setembro', 10 => 'Outubro', 11 => 'Novembro', 12 => 'Dezembro'
    ];
    $monthNamePt = $monthNames[$monthNumber] . ' de ' . $yearNumber;

    // 1. Stats – ALL filtered to current month
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM appointments WHERE appointment_date BETWEEN ? AND ?");
    $stmt->execute([$firstDayOfMonth, $lastDayOfMonth]);
    $totalAppointments = (int)$stmt->fetch()['total'];

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM appointments WHERE status = 'confirmed' AND appointment_date BETWEEN ? AND ?");
    $stmt->execute([$firstDayOfMonth, $lastDayOfMonth]);
    $confirmedAppointments = (int)$stmt->fetch()['total'];

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM appointments WHERE status = 'closed' AND contract_closed_at BETWEEN ? AND ?");
    $stmt->execute([$firstDayOfMonth, $lastDayOfMonth]);
    $contractsClosed = (int)$stmt->fetch()['total'];

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM credit_analysis WHERE status = 'pending' AND created_at BETWEEN ? AND ?");
    $stmt->execute([$firstDayOfMonth, $lastDayOfMonth]);
    $creditAnalysisPending = (int)$stmt->fetch()['total'];

    $conversionRate = $totalAppointments > 0 ? round(($contractsClosed / $totalAppointments) * 100) : 0;

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM clients WHERE client_registered_by = ? AND registered_at BETWEEN ? AND ?");
    $stmt->execute([$employeeId, $firstDayOfMonth, $lastDayOfMonth]);
    $myClients = (int)$stmt->fetch()['total'];

    $stats = [
        'total_appointments'          => $totalAppointments,
        'confirmed_appointments'      => $confirmedAppointments,
        'contracts_closed'            => $contractsClosed,
        'pending_credit_analysis'     => $creditAnalysisPending,
        'confirmation_rate'           => $conversionRate,
        'my_clients'                  => $myClients,
        'month_label'                 => $monthNamePt,
    ];

    // 2. Active Appointments – ALL records (keep old data visible)
    $stmt = $db->query("
        SELECT a.*, e.name AS confirmed_by_name
        FROM appointments a
        LEFT JOIN employees e ON a.confirmed_by = e.id
        WHERE (a.status IS NULL OR a.status IN ('pending','confirmed','approved'))
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 50
    ");
    $activeAppointments = $stmt->fetchAll();
    foreach ($activeAppointments as &$ap) {
        $ap['appointment_date_formatted'] = date('d-m-Y', strtotime($ap['appointment_date']));
        if ($ap['message']) {
            $ap['message'] = nl2br(htmlspecialchars($ap['message']));
        }
        $ap['confirmed_by_name'] = $ap['confirmed_by_name'] ?? 'Nao confirmado ainda';
    }
    unset($ap);

    // 3. Closed Contracts – ALL records
    $stmt = $db->query("
        SELECT a.*, e.name AS contract_closed_by_name
        FROM appointments a
        LEFT JOIN employees e ON a.contract_closed_by = e.id
        WHERE a.status = 'closed'
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 50
    ");
    $closedContracts = $stmt->fetchAll();
    foreach ($closedContracts as &$cc) {
        $cc['contract_closed_at_formatted'] = $cc['contract_closed_at']
            ? date('d-m-Y H:i:s', strtotime($cc['contract_closed_at']))
            : 'Nao Presente (Contate admin.)';
        if ($cc['message']) {
            $cc['message'] = nl2br(htmlspecialchars($cc['message']));
        }
        $cc['contract_closed_by_name'] = $cc['contract_closed_by_name'] ?? 'Nao identificado';
    }
    unset($cc);

    // 4. Credit Analyses – ALL records
    $stmt = $db->query("
        SELECT ca.*, e.name as confirmed_by_name,
               DATE_FORMAT(ca.created_at, '%d/%m/%Y %H:%i') as data_formatada
        FROM credit_analysis ca
        LEFT JOIN employees e ON ca.analyzed_by = e.id
        ORDER BY ca.created_at DESC
        LIMIT 50
    ");
    $creditAnalyses = $stmt->fetchAll();
    $statusTexts = ['pending' => 'Pendente', 'approved' => 'Aprovado', 'rejected' => 'Rejeitado'];
    foreach ($creditAnalyses as &$ca) {
        $ca['status_text'] = $statusTexts[$ca['status']] ?? 'Pendente';
        $ca['confirmed_by_name'] = $ca['confirmed_by_name'] ?? 'Nao identificado';
    }
    unset($ca);

    // 5. Clients – ALL records
    if ($employeeRole === 'admin' || $employeeRole === 'Administrativo') {
        $stmt = $db->query("
            SELECT c.*, e.name as registered_by_name
            FROM clients c
            LEFT JOIN employees e ON c.client_registered_by = e.id
            ORDER BY c.registered_at DESC
            LIMIT 50
        ");
    } else {
        $stmt = $db->prepare("
            SELECT c.*, e.name as registered_by_name
            FROM clients c
            LEFT JOIN employees e ON c.client_registered_by = e.id
            WHERE c.client_registered_by = ?
            ORDER BY c.registered_at DESC
            LIMIT 50
        ");
        $stmt->execute([$employeeId]);
    }
    $clients = $stmt->fetchAll();
    foreach ($clients as &$client) {
        $client['status_text'] = $client['status'] === 'active' ? 'Ativo' : 'Suspenso';
        $client['registered_at_formatted'] = date('d/m/Y H:i', strtotime($client['registered_at']));
    }
    unset($client);

    // 6. Month period string for display
    $firstDisplay = date('d/m/Y', strtotime($firstDayOfMonth));
    $lastDisplay  = date('d/m/Y', strtotime($lastDayOfMonth));

    $data = [
        'stats'              => $stats,
        'month_period'       => "{$firstDisplay} a {$lastDisplay}",
        'active_appointments' => $activeAppointments,
        'closed_contracts'   => $closedContracts,
        'credit_analyses'    => $creditAnalyses,
        'clients'            => $clients,
    ];

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor']);
}
