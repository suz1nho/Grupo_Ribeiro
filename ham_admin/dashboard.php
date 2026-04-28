<?php
session_start();
require_once __DIR__ . '/../config/database.php';

function svg_icon($filename, $class = '') {
    $path = __DIR__ . '/assets/svg/' . $filename;
    if (!file_exists($path)) {
        return '<!-- SVG not found: ' . $filename . ' -->';
    }
    $svg = file_get_contents($path);
    if ($svg === false) {
        return '<!-- SVG read error -->';
    }
    $svg = trim($svg);
    if (!empty($class)) {
        if (preg_match('/<svg([^>]*)>/', $svg, $matches)) {
            $existingAttrs = $matches[1];
            if (strpos($existingAttrs, 'class=') !== false) {
                $newSvg = str_replace($matches[0], '<svg' . preg_replace('/class="([^"]*)"/', 'class="$1 ' . htmlspecialchars($class) . '"', $existingAttrs) . '>', $svg);
            } else {
                $newSvg = str_replace($matches[0], '<svg' . $existingAttrs . ' class="' . htmlspecialchars($class) . '">', $svg);
            }
            $svg = $newSvg;
        }
    }
    return $svg;
}

if (!isset($_SESSION['employee_id'])) {
    header('Location: index.php');
    exit;
}

$db = Database::getInstance()->getConnection();

try {
    $stmt = $db->query("SELECT COUNT(*) as total FROM appointments");
    $totalAppointments = $stmt->fetch()['total'] ?? 0;

    $stmt = $db->query("SELECT COUNT(*) as total FROM appointments WHERE status = 'confirmed'");
    $confirmedAppointments = $stmt->fetch()['total'] ?? 0;

    $stmt = $db->query("SELECT COUNT(*) as total FROM appointments WHERE status = 'closed'");
    $contractsClosed = $stmt->fetch()['total'] ?? 0;
    
    $stmt = $db->query("SELECT COUNT(*) as total FROM credit_analysis WHERE status = 'pending'");
    $creditAnalysisPending = $stmt->fetch()['total'] ?? 0;
    
    $confirmationRate = $totalAppointments > 0 ? round(($contractsClosed / $totalAppointments) * 100) : 0;
    
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM clients WHERE client_registered_by = ?");
    $stmt->execute([$_SESSION['employee_id']]);
    $myClients = $stmt->fetch()['total'] ?? 0;
    
    $stmt = $db->query(
    "SELECT
        a.*, e.name AS confirmed_by_name
    FROM appointments
        a LEFT JOIN employees e ON a.confirmed_by = e.id
    WHERE
        a.status = 'pending' OR
        a.status = 'confirmed' OR
        a.status = 'approved' OR
        a.status IS NULL
        ORDER BY
            appointment_date DESC,
            appointment_time DESC
        LIMIT 50");
    $recentAppointments = $stmt->fetchAll();
    
    $stmt = $db->query(
    "SELECT
        a.*,
        e.name AS contract_closed_by_name
    FROM appointments
        a LEFT JOIN employees e ON a.contract_closed_by = e.id
    WHERE
        a.status = 'closed' OR
        a.status IS NULL
        ORDER BY
            a.appointment_date DESC,
            a.appointment_time DESC
        LIMIT 50");

    $closedContracts = $stmt->fetchAll();
    
    $stmt = $db->query(
    "SELECT
        ca.*,
        e.name as confirmed_by_name,
        DATE_FORMAT(ca.created_at, '%d/%m/%Y %H:%i') as data_formatada
    FROM credit_analysis ca
    LEFT JOIN employees e ON ca.analyzed_by = e.id
    ORDER BY ca.created_at DESC
    LIMIT 50");

    $creditAnalyses = $stmt->fetchAll();
    
    if ($_SESSION['employee_role'] === 'admin' || $_SESSION['employee_role'] === 'Administrativo') {
        $stmt = $db->query(
        "SELECT
            c.*,
            e.name as registered_by_name
        FROM clients c
        LEFT JOIN employees e ON c.client_registered_by = e.id
        ORDER BY c.registered_at DESC
        LIMIT 50");
    } else {
        $stmt = $db->prepare(
        "SELECT
            c.*,
            e.name as registered_by_name
        FROM clients c
        LEFT JOIN employees e ON c.client_registered_by = e.id
        WHERE c.client_registered_by = ?
        ORDER BY c.registered_at DESC
        LIMIT 50");
        $stmt->execute([$_SESSION['employee_id']]);
    }
    
    $clients = $stmt->fetchAll();
    
} catch (PDOException $e) {
    error_log($e->getMessage());
    $totalAppointments = 0;
    $confirmedAppointments = 0;
    $contractsClosed = 0;
    $creditAnalysisPending = 0;
    $confirmationRate = 0;
    $myClients = 0;
    $recentAppointments = [];
    $closedContracts = [];
    $creditAnalyses = [];
    $clients = [];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo - GR7</title>
    <link rel="stylesheet" href="../assets/css/dashboard.css">
</head>
<body>
    <div class="container">
        <div class="dashboard-header">
            <div>
                <h1>Painel Administrativo</h1>
                <p>Logado como: <span class="user-name"><?php echo htmlspecialchars($_SESSION['employee_name']); ?></span> (<?php echo htmlspecialchars($_SESSION['employee_role'] ?? 'Administrativo'); ?>)</p>
            </div>
            <div class="header-actions">
                <button id="mobile-menu-btn" class="mobile-menu-btn" onclick="toggleMobileMenu()">
                    <?php echo svg_icon('menu.svg', 'inline-icon'); ?>
                    Menu
                </button>
                <a href="logout.php" class="btn-logout">Sair</a>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-card-header">
                    <div class="stat-card-content">
                        <h3>Total de Agendamentos</h3>
                        <div class="stat-card-value"><?php echo $totalAppointments; ?></div>
                        <div class="stat-card-label">Todos os agendamentos</div>
                    </div>
                    <div class="stat-card-icon">
                        <?php echo svg_icon('total_appointments.svg', 'stat-icon-svg'); ?>
                    </div>
                </div>
            </div>

            <div class="stat-card orange">
                <div class="stat-card-header">
                    <div class="stat-card-content">
                        <h3>Agendamentos Confirmados</h3>
                        <div class="stat-card-value"><?php echo $confirmedAppointments; ?></div>
                        <div class="stat-card-label">Presença confirmada</div>
                    </div>
                    <div class="stat-card-icon">
                        <?php echo svg_icon('confirmed.svg', 'stat-icon-svg'); ?>
                    </div>
                </div>
            </div>

            <div class="stat-card green">
                <div class="stat-card-header">
                    <div class="stat-card-content">
                        <h3>Contratos Fechados</h3>
                        <div class="stat-card-value"><?php echo $contractsClosed; ?></div>
                        <div class="stat-card-label">Contratos concluídos</div>
                    </div>
                    <div class="stat-card-icon">
                        <?php echo svg_icon('document.svg', 'stat-icon-svg'); ?>
                    </div>
                </div>
            </div>

            <div class="stat-card cyan">
                <div class="stat-card-header">
                    <div class="stat-card-content">
                        <h3>Análise de Crédito</h3>
                        <div class="stat-card-value"><?php echo $creditAnalysisPending; ?></div>
                        <div class="stat-card-label">Pendentes de análise</div>
                    </div>
                    <div class="stat-card-icon">
                        <?php echo svg_icon('document.svg', 'stat-icon-svg'); ?>
                    </div>
                </div>
            </div>

            <div class="stat-card purple">
                <div class="stat-card-header">
                    <div class="stat-card-content">
                        <h3>Taxa de Conversão</h3>
                        <div class="stat-card-value"><?php echo $confirmationRate; ?>%</div>
                        <div class="stat-card-label">Taxa de conversão</div>
                    </div>
                    <div class="stat-card-icon">
                        <?php echo svg_icon('conversion_rate.svg', 'stat-icon-svg'); ?>
                    </div>
                </div>
            </div>

            <div class="stat-card indigo">
                <div class="stat-card-header">
                    <div class="stat-card-content">
                        <h3>Meus Clientes</h3>
                        <div class="stat-card-value"><?php echo $myClients; ?></div>
                        <div class="stat-card-label">Clientes cadastrados por você</div>
                    </div>
                    <div class="stat-card-icon">
                        <?php echo svg_icon('clients.svg', 'stat-icon-svg'); ?>
                    </div>
                </div>
            </div>
        </div>

        <div id="mobile-menu" class="mobile-menu-overlay">
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h2>Menu</h2>
                    <button onclick="toggleMobileMenu()" class="mobile-menu-close">
                        <?php echo svg_icon('x.svg', 'inline-icon'); ?>
                    </button>
                </div>
                
                <div class="mobile-stats-list">
                    <div class="mobile-stat-card blue">
                        <div class="mobile-stat-icon">
                            <?php echo svg_icon('total_appointments.svg', 'mobile-stat-icon-svg'); ?>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Total de Agendamentos</h3>
                            <div class="mobile-stat-value"><?php echo $totalAppointments; ?></div>
                            <div class="mobile-stat-label">Todos os agendamentos</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card orange">
                        <div class="mobile-stat-icon">
                            <?php echo svg_icon('confirmed.svg', 'mobile-stat-icon-svg'); ?>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Agendamentos Confirmados</h3>
                            <div class="mobile-stat-value"><?php echo $confirmedAppointments; ?></div>
                            <div class="mobile-stat-label">Presença confirmada</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card green">
                        <div class="mobile-stat-icon">
                            <?php echo svg_icon('document.svg', 'mobile-stat-icon-svg'); ?>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Contratos Fechados</h3>
                            <div class="mobile-stat-value"><?php echo $contractsClosed; ?></div>
                            <div class="mobile-stat-label">Contratos concluídos</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card cyan">
                        <div class="mobile-stat-icon">
                            <?php echo svg_icon('document.svg', 'mobile-stat-icon-svg'); ?>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Análise de Crédito</h3>
                            <div class="mobile-stat-value"><?php echo $creditAnalysisPending; ?></div>
                            <div class="mobile-stat-label">Pendentes de análise</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card purple">
                        <div class="mobile-stat-icon">
                            <?php echo svg_icon('conversion_rate.svg', 'mobile-stat-icon-svg'); ?>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Taxa Confirmação</h3>
                            <div class="mobile-stat-value"><?php echo $confirmationRate; ?>%</div>
                            <div class="mobile-stat-label">Taxa de conversão</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card indigo">
                        <div class="mobile-stat-icon">
                            <?php echo svg_icon('clients.svg', 'mobile-stat-icon-svg'); ?>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Meus Clientes</h3>
                            <div class="mobile-stat-value"><?php echo $myClients; ?></div>
                            <div class="mobile-stat-label">Clientes cadastrados por você</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-panel">
            <div class="tabs-nav">
                <button onclick="switchTab('active')" id="tab-active" class="tab-btn active">
                    Agendamentos Ativos
                </button>
                <button onclick="switchTab('closed')" id="tab-closed" class="tab-btn">
                    Contratos Fechados
                </button>
                <button onclick="switchTab('credit')" id="tab-credit" class="tab-btn">
                    Análise de Crédito
                </button>
                <button onclick="switchTab('clients')" id="tab-clients" class="tab-btn">
                    Clientes
                </button>
            </div>

            <div id="content-active" class="tab-content">
                <div id="appointmentsList" class="space-y-4">
                    <?php if (empty($recentAppointments)): ?>
                        <div class="text-center py-12 text-gray-500">
                            Nenhum agendamento no momento
                        </div>
                    <?php else: ?>
                        <?php foreach ($recentAppointments as $appointment): ?>
                            <div class="appointment-card">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('total_appointments.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Data</p>
                                                <p class="font-semibold text-gray-900"><?php echo date('d-m-Y', strtotime($appointment['appointment_date'])); ?></p>
                                            </div>
                                        </div>
                                        
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clock.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Horário</p>
                                                <p class="font-semibold text-gray-900"><?php echo $appointment['appointment_time']; ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clock.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Atendente responsável</p>
                                                <p class="font-semibold text-gray-900">
<?php
    if ($appointment['confirmed_by_name'] != null) {
        if ($appointment['status'] == "pending") {
            echo "Não confirmado ainda";
        } else
            echo htmlspecialchars($appointment['confirmed_by_name']);
    } else
    echo "Não confirmado ainda";
?>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Nome</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($appointment['name']); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Email</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($appointment['email']); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Telefone</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($appointment['phone']); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
<?php if (!empty($appointment['message'])): ?>
                                <div class="flex items-center gap-3">
                                    <?php echo svg_icon('document.svg', 'info-icon'); ?>
                                    <div>
                                        <p class="font-semibold text-blue-800 flex items-center gap-2">Mensagem do Cliente</p>
                                        <p class="text-sm text-blue-700 mt-2 leading-relaxed">
<?php echo nl2br(htmlspecialchars($appointment['message'])); ?>
                                        </p>
                                    </div>
                                </div>
<?php endif; ?>
                                <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <?php if (($appointment['status'] == 'confirmed' || $appointment['status'] == 'approved') && $appointment['confirmed_by'] == $_SESSION['employee_id']): ?>
                                        <button onclick="unconfirmAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-red-600 hover:bg-red-700">
                                            <?php echo svg_icon('x.svg', 'btn-icon'); ?>
                                            Desconfirmar
                                        </button>
                                        <button onclick="showNotesModal(<?php echo $appointment['id']; ?>)" class="admin-btn bg-purple-600 hover:bg-purple-700">
                                            <?php echo svg_icon('document.svg', 'btn-icon'); ?>
                                            Informações
                                        </button>
                                        <button onclick="markContract(<?php echo $appointment['id']; ?>)" class="admin-btn bg-gray-600 hover:bg-gray-700">
                                            <?php echo svg_icon('confirmed.svg', 'btn-icon'); ?>
                                            Marcar Contrato
                                        </button>
                                    <?php elseif ($appointment['status'] !== 'confirmed' && $appointment['status'] !== 'approved'): ?>
                                        <button onclick="confirmAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-green-600 hover:bg-green-700">
                                            <?php echo svg_icon('confirmed.svg', 'btn-icon'); ?>
                                            Confirmar Presença
                                        </button>
                                        <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                            <button onclick="deleteAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-red-500 hover:bg-red-600">Deletar</button>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                    <button onclick="printAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-blue-600 hover:bg-blue-700">
                                        <?php echo svg_icon('printer.svg', 'btn-icon'); ?>
                                        Imprimir
                                    </button>
                                    <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                        <button onclick="deleteAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-red-500 hover:bg-red-600">Deletar</button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <div id="content-closed" class="tab-content" style="display: none;">
                <div id="closedContractsList" class="space-y-4">
                    <?php if (empty($closedContracts)): ?>
                        <div class="text-center py-12 text-gray-500">Nenhum contrato fechado no momento</div>
                    <?php else: ?>
                        <?php foreach ($closedContracts as $contract): ?>
                            <div class="appointment-card bg-green-50 border-green-200">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('total_appointments.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Data em que o contrato foi fechado</p>
                                                <p class="font-semibold text-gray-900">
<?php if (isset($contract["contract_closed_at"]) == true) {
    echo date('d-m-Y', strtotime($contract["contract_closed_at"]));
    echo(" As ");
    echo date('H:i:s', strtotime($contract["contract_closed_at"]));
} else echo "Não Presente (Contate admin.)"; ?>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clock.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Horário</p>
                                                <p class="font-semibold text-gray-900"><?php echo $contract['appointment_time']; ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Atendente responsável</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($contract['contract_closed_by_name'] ?? 'Não identificado'); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Nome</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($contract['name']); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Email</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($contract['email']); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Telefone</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($contract['phone']); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
<?php if (!empty($contract['message'])): ?>
                                <div class="flex items-center gap-3">
                                    <?php echo svg_icon('document.svg', 'info-icon'); ?>
                                    <div>
                                        <p class="font-semibold text-blue-800 flex items-center gap-2">Mensagem do Cliente</p>
                                        <p class="text-sm text-blue-700 mt-2 leading-relaxed"><?php echo nl2br(htmlspecialchars($contract['message'])); ?></p>
                                    </div>
                                </div>
<?php endif; ?>
                                <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <button onclick="printAppointment(<?php echo $contract['id']; ?>)" class="admin-btn bg-blue-600 hover:bg-blue-700">
                                        <?php echo svg_icon('printer.svg', 'btn-icon'); ?>
                                        Imprimir
                                    </button>
                                    <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                        <button onclick="deleteAppointment(<?php echo $contract['id']; ?>)" class="admin-btn bg-red-500 hover:bg-red-600">Deletar</button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <div id="content-credit" class="tab-content" style="display: none;">
                <div id="creditAnalysisList" class="space-y-4">
                    <?php if (empty($creditAnalyses)): ?>
                        <div class="text-center py-12 text-gray-500">Nenhuma análise de crédito no momento</div>
                    <?php else: ?>
                        <?php foreach ($creditAnalyses as $analysis): ?>
                            <div class="appointment-card bg-cyan-50 border-cyan-200">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('total_appointments.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Data de Envio</p>
                                                <p class="font-semibold text-gray-900"><?php echo $analysis['data_formatada']; ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Telefone</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($analysis['phone']); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('confirmed.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Status</p>
                                                <p class="font-semibold text-gray-900">
<?php $statusText = ['pending' => 'Pendente', 'approved' => 'Aprovado', 'rejected' => 'Rejeitado']; echo $statusText[$analysis['status']] ?? 'Pendente'; ?>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Nome</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($analysis['name'] ?? "Nome não disponível"); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Email</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($analysis['email'] ?? "E-mail não disponível"); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Atendente responsável</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($analysis['confirmed_by_name'] ?? 'Não identificado'); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br>
                                <?php if ($analysis['analyzed_by']): ?>
                                    <button onclick="viewCreditDocuments(<?php echo $analysis['id']; ?>)" class="admin-btn bg-blue-600 hover:bg-blue-700">
                                        <?php echo svg_icon('eye.svg', 'btn-icon'); ?>
                                        Ver Documentos
                                    </button>
                                    <button onclick="updateCreditStatus(<?php echo $analysis['id']; ?>, 'pending')" class="admin-btn bg-yellow-600 hover:bg-yellow-700">
                                        <?php echo svg_icon('clock.svg', 'btn-icon'); ?>
                                        Pendente
                                    </button>
                                    <button onclick="updateCreditStatus(<?php echo $analysis['id']; ?>, 'approved')" class="admin-btn bg-green-600 hover:bg-green-700">
                                        <?php echo svg_icon('confirmed.svg', 'btn-icon'); ?>
                                        Aprovado
                                    </button>
                                    <button onclick="updateCreditStatus(<?php echo $analysis['id']; ?>, 'rejected')" class="admin-btn bg-red-600 hover:bg-red-700">
                                        <?php echo svg_icon('x.svg', 'btn-icon'); ?>
                                        Rejeitado
                                    </button>
                                    <button onclick="unconfirmCreditAnalysis(<?php echo $analysis['id']; ?>)" class="admin-btn bg-gray-600 hover:bg-gray-700">
                                        <?php echo svg_icon('x.svg', 'btn-icon'); ?>
                                        Desmarcar Análise
                                    </button>
                                    <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                        <button onclick="deleteCreditAnalysis(<?php echo $analysis['id']; ?>)" class="admin-btn bg-red-800 hover:bg-red-900">
                                            <?php echo svg_icon('x.svg', 'btn-icon'); ?>
                                            Deletar
                                        </button>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <button onclick="viewCreditDocuments(<?php echo $analysis['id']; ?>)" class="admin-btn bg-blue-600 hover:bg-blue-700">
                                        <?php echo svg_icon('eye.svg', 'btn-icon'); ?>
                                        Ver Documentos
                                    </button>
                                    <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                        <button onclick="deleteCreditAnalysis(<?php echo $analysis['id']; ?>)" class="admin-btn bg-red-800 hover:bg-red-900">
                                            <?php echo svg_icon('x.svg', 'btn-icon'); ?>
                                            Deletar
                                        </button>
                                    <?php endif; ?>
                                    <button onclick="confirmCreditAnalysis(<?php echo $analysis['id']; ?>)" class="admin-btn bg-green-600 hover:bg-green-700">
                                        <?php echo svg_icon('confirmed.svg', 'btn-icon'); ?>
                                        Confirmar Análise de Crédito
                                    </button>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
            
            <div id="content-clients" class="tab-content" style="display: none;">
                <div class="clients-tab-header">
                    <span class="clients-count">Total: <?php echo count($clients); ?> clientes cadastrados</span>
                    <button onclick="showAddClientModal()" class="add-client-btn">
                        <?php echo svg_icon('clients.svg', 'btn-icon'); ?>
                        Adicionar Cliente
                    </button>
                </div>
                <div id="clientsList" class="space-y-4">
                    <?php if (empty($clients)): ?>
                        <div class="text-center py-12 text-gray-500">Nenhum cliente cadastrado no momento</div>
                    <?php else: ?>
                        <?php foreach ($clients as $client): ?>
                            <div class="appointment-card bg-blue-50 border-blue-200">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Nome</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($client['name']); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">CPF</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($client['cpf'] ?? 'Não informado'); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('confirmed.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Status</p>
                                                <p class="font-semibold text-gray-900"><?php echo $client['status'] === 'active' ? 'Ativo' : 'Suspenso'; ?></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Email</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($client['email'] ?? 'Não informado'); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('clients.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Telefone</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($client['phone'] ?? 'Não informado'); ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <?php echo svg_icon('total_appointments.svg', 'info-icon'); ?>
                                            <div>
                                                <p class="text-xs text-gray-600">Registrado em</p>
                                                <p class="font-semibold text-gray-900"><?php echo date('d/m/Y H:i', strtotime($client['registered_at'])); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <?php if (!empty($client['description'])): ?>
                                <div class="flex items-center gap-3 mt-4">
                                    <?php echo svg_icon('document.svg', 'info-icon'); ?>
                                    <div>
                                        <p class="font-semibold text-blue-800 flex items-center gap-2">Descrição</p>
                                        <p class="text-sm text-blue-700 mt-2 leading-relaxed"><?php echo nl2br(htmlspecialchars($client['description'])); ?></p>
                                    </div>
                                </div>
                                <?php endif; ?>
                                <?php if (!empty($client['registered_by_name'])): ?>
                                <div class="mt-4 pt-4 border-t border-blue-200">
                                    <p class="text-xs text-blue-600">Registrado por: <span class="font-semibold"><?php echo htmlspecialchars($client['registered_by_name']); ?></span></p>
                                </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.employeeId = <?php echo json_encode($_SESSION['employee_id']); ?>;
        window.employeeRole = <?php echo json_encode($_SESSION['employee_role']); ?>;
    </script>
    <script src="../assets/js/dashboard.js"></script>
</body>
</html>
