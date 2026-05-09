<?php
session_start();
require_once __DIR__ . '/../config/database.php';

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

    // 1. Stats
    $stmt = $db->query("SELECT COUNT(*) as total FROM appointments");
    $totalAppointments = (int)$stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM appointments WHERE status = 'confirmed'");
    $confirmedAppointments = (int)$stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM appointments WHERE status = 'closed'");
    $contractsClosed = (int)$stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) as total FROM credit_analysis WHERE status = 'pending'");
    $creditAnalysisPending = (int)$stmt->fetch()['total'];

    $conversionRate = $totalAppointments > 0 ? round(($contractsClosed / $totalAppointments) * 100) : 0;

    $stmt = $db->prepare("SELECT COUNT(*) as total FROM clients WHERE client_registered_by = ?");
    $stmt->execute([$employeeId]);
    $myClients = (int)$stmt->fetch()['total'];

    $stats = [
        'total_appointments'       => $totalAppointments,
        'confirmed_appointments'   => $confirmedAppointments,
        'contracts_closed'         => $contractsClosed,
        'pending_credit_analysis'  => $creditAnalysisPending,
        'confirmation_rate'        => $conversionRate,
        'my_clients'               => $myClients,
    ];

    // 2. Active Appointments
    $stmt = $db->query("
        SELECT a.*, e.name AS confirmed_by_name
        FROM appointments a
        LEFT JOIN employees e ON a.confirmed_by = e.id
        WHERE a.status IS NULL OR a.status IN ('pending','confirmed','approved')
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 50
    ");
    $activeAppointments = $stmt->fetchAll();
    foreach ($activeAppointments as &$ap) {
        $ap['appointment_date_formatted'] = date('d-m-Y', strtotime($ap['appointment_date']));
        if ($ap['message']) {
            $ap['message'] = nl2br(htmlspecialchars($ap['message']));
        }
        $ap['confirmed_by_name'] = $ap['confirmed_by_name'] ?? 'Não confirmado ainda';
    }
    unset($ap);

    // 3. Closed Contracts
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
            : 'Não Presente (Contate admin.)';
        if ($cc['message']) {
            $cc['message'] = nl2br(htmlspecialchars($cc['message']));
        }
        $cc['contract_closed_by_name'] = $cc['contract_closed_by_name'] ?? 'Não identificado';
    }
    unset($cc);

    // 4. Credit Analyses
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
        $ca['confirmed_by_name'] = $ca['confirmed_by_name'] ?? 'Não identificado';
    }
    unset($ca);

    // 5. Clients
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

    // Assemble response
    $data = [
        'stats'             => $stats,
        'active_appointments' => $activeAppointments,
        'closed_contracts'    => $closedContracts,
        'credit_analyses'     => $creditAnalyses,
        'clients'             => $clients,
    ];

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor']);
}
