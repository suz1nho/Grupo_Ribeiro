<?php
session_start();
require_once __DIR__ . '/../config/database.php';

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
    
} catch (PDOException $e) {
    error_log($e->getMessage());
    $totalAppointments = 0;
    $confirmedAppointments = 0;
    $contractsClosed = 0;
    $creditAnalysisPending = 0;
    $confirmationRate = 0;
    $recentAppointments = [];
    $closedContracts = [];
    $creditAnalyses = [];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo - GR7</title>
    <!-- Updated CSS to use new professional dashboard stylesheet -->
    <link rel="stylesheet" href="../assets/css/dashboard.css">
</head>
<body>
    <div class="container">
        <!-- Updated header structure with new classes -->
        <div class="dashboard-header">
            <div>
                <h1>Painel Administrativo</h1>
                <p>Logado como: <span class="user-name"><?php echo htmlspecialchars($_SESSION['employee_name']); ?></span> (<?php echo htmlspecialchars($_SESSION['employee_role'] ?? 'Administrativo'); ?>)</p>
            </div>
            <div class="header-actions">
                <!-- Mobile menu button (shown only on mobile) -->
                <button id="mobile-menu-btn" class="mobile-menu-btn" onclick="toggleMobileMenu()">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    Menu
                </button>
                <a href="logout.php" class="btn-logout">Sair</a>
            </div>
        </div>

        <!-- Updated stats cards with new structure and classes -->
        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-card-header">
                    <div class="stat-card-content">
                        <h3>Total de Agendamentos</h3>
                        <div class="stat-card-value"><?php echo $totalAppointments; ?></div>
                        <div class="stat-card-label">Todos os agendamentos</div>
                    </div>
                    <div class="stat-card-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
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
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
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
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
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
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
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
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Added mobile menu overlay -->
        <div id="mobile-menu" class="mobile-menu-overlay">
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h2>Menu</h2>
                    <button onclick="toggleMobileMenu()" class="mobile-menu-close">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="mobile-stats-list">
                    <div class="mobile-stat-card blue">
                        <div class="mobile-stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Total de Agendamentos</h3>
                            <div class="mobile-stat-value"><?php echo $totalAppointments; ?></div>
                            <div class="mobile-stat-label">Todos os agendamentos</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card orange">
                        <div class="mobile-stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Agendamentos Confirmados</h3>
                            <div class="mobile-stat-value"><?php echo $confirmedAppointments; ?></div>
                            <div class="mobile-stat-label">Presença confirmada</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card green">
                        <div class="mobile-stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Contratos Fechados</h3>
                            <div class="mobile-stat-value"><?php echo $contractsClosed; ?></div>
                            <div class="mobile-stat-label">Contratos concluídos</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card cyan">
                        <div class="mobile-stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Análise de Crédito</h3>
                            <div class="mobile-stat-value"><?php echo $creditAnalysisPending; ?></div>
                            <div class="mobile-stat-label">Pendentes de análise</div>
                        </div>
                    </div>

                    <div class="mobile-stat-card purple">
                        <div class="mobile-stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <div class="mobile-stat-content">
                            <h3>Taxa Confirmação</h3>
                            <div class="mobile-stat-value"><?php echo $confirmationRate; ?>%</div>
                            <div class="mobile-stat-label">Taxa de conversão</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Updated content panel with active tab stored in localStorage -->
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
            </div>

            <!-- Tab Content: Agendamentos Ativos -->
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
                                        <!-- Data -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Data</p>
                                                <p class="font-semibold text-gray-900"><?php echo date('d-m-Y', strtotime($appointment['appointment_date'])); ?></p>
                                            </div>
                                        </div>
                                        
                                        <!-- Horário -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Horário</p>
                                                <p class="font-semibold text-gray-900"><?php echo $appointment['appointment_time']; ?></p>
                                            </div>
                                        </div>


                                        <!-- Atendente responsável agendamentos ativos -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Atendente responsável</p>
                                                <p class="font-semibold text-gray-900">
<?php
    if ($appointment['confirmed_by_name'] != null) {

        if ($appointment['status'] == "pending") {
            echo "Não confirmado ainda"; // desconfirmado

        } else
            echo htmlspecialchars($appointment['confirmed_by_name']);

    } else
    echo "Não confirmado ainda"; // nunca confirmado
    // error_log(json_encode($appointment));
?>
                                                </p>
                                            </div>
                                        </div>

                                    </div>

                                    <div class="space-y-3">
                                        <!-- Nome -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Nome</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($appointment['name']); ?></p>
                                            </div>
                                        </div>
                                        
                                        <!-- Email -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Email</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($appointment['email']); ?></p>
                                            </div>
                                        </div>
                                        
                                        <!-- Telefone -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Telefone</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($appointment['phone']); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Display client message if provided -->
<?php
    // if (!empty($appointment['message']) && ($appointment['status'] == 'confirmed' || $appointment['status'] == 'approved') && $appointment['confirmed_by'] == $_SESSION['employee_id']):
?>

<?php
    if (!empty($appointment['message'])):
?>

                                <!-- Mensagem do cliente Contrato Ativo -->
                                <div class="flex items-center gap-3">
                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                    <div>
                                        <p class="font-semibold text-blue-800 flex items-center gap-2">

                                            Mensagem do Cliente
                                        </p>
                                        <p class="text-sm text-blue-700 mt-2 leading-relaxed">
<?php
    echo nl2br(htmlspecialchars($appointment['message']));
?>
                                        </p>
                                    </div>
                                </div>

<?php
    endif;
?>

                                <!-- Action buttons -->
                                <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <?php // Adicionado status 'approved' para mostrar botões após confirmação ?>
                                    <?php if (($appointment['status'] == 'confirmed' || $appointment['status'] == 'approved') && $appointment['confirmed_by']): ?>
                                        <!-- Buttons only for employee who confirmed -->
                                        <button onclick="unconfirmAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-red-600 hover:bg-red-700">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            Desconfirmar
                                        </button>
                                        
                                        <!-- Simplificado para apenas passar o ID -->
                                        <button 
                                            onclick="showNotesModal(<?php echo $appointment['id']; ?>)" 
                                            class="admin-btn bg-purple-600 hover:bg-purple-700"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            Informações
                                        </button>
                                        
                                        <button onclick="markContract(<?php echo $appointment['id']; ?>)" class="admin-btn bg-gray-600 hover:bg-gray-700">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            Marcar Contrato
                                        </button>
                                        
                                        <button onclick="printAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-blue-600 hover:bg-blue-700">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                            </svg>
                                            Imprimir
                                        </button>
                                        
                                        <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                            <button onclick="deleteAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-red-500 hover:bg-red-600">
                                                Deletar
                                            </button>
                                        <?php endif; ?>
                                    <?php // Adicionado status 'approved' na condição ?>
                                    <?php elseif ($appointment['status'] !== 'confirmed' && $appointment['status'] !== 'approved'): ?>
                                        <!-- Show confirm button only if not confirmed -->
                                        <button onclick="confirmAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-green-600 hover:bg-green-700">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Confirmar Presença
                                        </button>
                                        
                                        <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                            <button onclick="deleteAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-red-500 hover:bg-red-600">
                                                Deletar
                                            </button>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                </div>
                                
                                <!-- Updated confirmation status display with red background and better styling -->
                                <?php /*
                                <?php // Adicionado status 'approved' para mostrar mensagem de bloqueio ?>
                                <?php if (($appointment['status'] === 'confirmed' || $appointment['status'] === 'approved') && $appointment['confirmed_by']): ?>
                                    <div class="mt-4 p-4 bg-red-100 border-l-4 border-red-600 rounded-md shadow-sm">
                                        <div class="flex items-center gap-2">

                                            <p class="font-bold text-red-900">HORÁRIO BLOQUEADO - Presença Confirmada</p>
                                        </div>
                                        <p class="text-sm text-red-700 mt-2 font-medium">
                                             Atendente responsável: <?php echo htmlspecialchars($appointment['confirmed_by_name'] ?? 'Não identificado'); ?>
                                        </p>
                                        <p class="text-xs text-red-600 mt-1 italic">
                                            Este horário não estará disponível no calendário público até ser desconfirmado
                                        </p>
                                    </div>
                                <?php endif; ?>
                                */ ?>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Tab Content: Contratos Fechados -->
            <div id="content-closed" class="tab-content" style="display: none;">
                <div id="closedContractsList" class="space-y-4">
                    <?php if (empty($closedContracts)): ?>
                        <div class="text-center py-12 text-gray-500">
                            Nenhum contrato fechado no momento
                        </div>
                    <?php else: ?>
                        <?php foreach ($closedContracts as $contract): ?>
                            <div class="appointment-card bg-green-50 border-green-200">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-3">
                                        <!-- Data -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Data em que o contrato foi fechado</p>
                                                <p class="font-semibold text-gray-900">
<?php
if (isset($contract["contract_closed_at"]) == true) {

    echo date('d-m-Y',
              strtotime($contract["contract_closed_at"]));

    echo(" As ");

    echo date('H:i:s',
              strtotime($contract["contract_closed_at"]));
} else
    echo "Não Presente (Contate admin.)";

?></p>
                                            </div>
                                        </div>
                                        
                                        <!-- Horário -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Horário</p>
                                                <p class="font-semibold text-gray-900"><?php echo $contract['appointment_time']; ?></p>
                                            </div>
                                        </div>


                                        <!-- Atentende -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>

                                            <div>
                                                <p class="text-xs text-gray-600">Atendente responsável</p>
                                                <p class="font-semibold text-gray-900">
<?php
    echo htmlspecialchars(
        $contract['contract_closed_by_name']
            ??
        'Não identificado');
    // error_log(json_encode($contract));
?>
                                                </p>
                                            </div>
                                        </div> <!-- Atendente -->
                                    </div>
<?php
    // error_log(json_encode($contract));
    // error_log(strtotime($contract["contract_closed_at"]));
?>

                                    <div class="space-y-3">
                                        <!-- Nome -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Nome</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($contract['name']); ?></p>
                                            </div>
                                        </div>
                                        
                                        <!-- Email -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Email</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($contract['email']); ?></p>
                                            </div>
                                        </div>
                                        
                                        <!-- Telefone -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Telefone</p>
                                                <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($contract['phone']); ?></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <!-- Mensagem do cliente Contrato Fechado -->
                                <div class="flex items-center gap-3">
                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                    <div>
                                        <p class="font-semibold text-blue-800 flex items-center gap-2">

                                            Mensagem do Cliente
                                        </p>
                                        <p class="text-sm text-blue-700 mt-2 leading-relaxed">
<?php

    // echo htmlspecialchars($contract['message']);
    echo nl2br(htmlspecialchars($contract['message']));
?>

                                        </p>
                                    </div>
                                </div>

                                <!-- Action buttons for closed contracts -->
                                <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <button onclick="printAppointment(<?php echo $contract['id']; ?>)" class="admin-btn bg-blue-600 hover:bg-blue-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                        </svg>
                                        Imprimir
                                    </button>
                                    
                                    <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                        <button onclick="deleteAppointment(<?php echo $contract['id']; ?>)" class="admin-btn bg-red-500 hover:bg-red-600">
                                            Deletar
                                        </button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <!-- NEW Tab Content: Análise de Crédito -->
            <div id="content-credit" class="tab-content" style="display: none;">
                <div id="creditAnalysisList" class="space-y-4">

                    <?php if (empty($creditAnalyses)): ?>
                        <div class="text-center py-12 text-gray-500">
                            Nenhuma análise de crédito no momento
                        </div>
                    <?php else: ?>

                        <?php foreach ($creditAnalyses as $analysis): ?>
                            <div class="appointment-card bg-cyan-50 border-cyan-200">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="space-y-3">
                                        <!-- Data de Envio -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Data de Envio</p>
                                                <p class="font-semibold text-gray-900">
<?php
    echo $analysis['data_formatada'];
?>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <!-- Telefone -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Telefone</p>
                                                <p class="font-semibold text-gray-900">
<?php
    echo htmlspecialchars($analysis['phone']);
?>
                                                </p>
                                            </div>
                                        </div>

                                        <!-- Status -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Status</p>
                                                <p class="font-semibold text-gray-900">
<?php
    $statusText = [
        'pending' => 'Pendente',
        'approved' => 'Aprovado',
        'rejected' => 'Rejeitado'
    ];
    echo $statusText[$analysis['status']] ?? 'Pendente';
?>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-3">
                                        <!-- Nome -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Nome</p>
                                                <p class="font-semibold text-gray-900">
<?php
    echo htmlspecialchars(
        $analysis['name']
    ??
        "Nome não disponível"
    );
?>
                                            </p>
                                            </div>
                                        </div>
                                        
                                        <!-- Email -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                            <div>
                                                <p class="text-xs text-gray-600">Email</p>
                                                <p class="font-semibold text-gray-900">
<?php
    echo htmlspecialchars(
        $analysis['email']
    ??
        "E-mail não disponível"
    );
?>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <!-- Atentende -->
                                        <div class="flex items-center gap-3">
                                            <svg class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>

                                            <div>
                                                <p class="text-xs text-gray-600">Atendente responsável</p>
                                                <p class="font-semibold text-gray-900">
<?php
    echo htmlspecialchars(
        $analysis['confirmed_by_name']
            ??
        'Não identificado');
?>
                                                </p>
                                            </div>
                                        </div> <!-- Atendente -->

                                    </div>
                                </div>


                                <!-- Action buttons --><br>
                                <?php if ($analysis['analyzed_by']): ?>
                                    <!-- Mostrar botão Ver Documentos sempre como primeiro botão após confirmação -->
                                    <button onclick="viewCreditDocuments(<?php echo $analysis['id']; ?>)" class="admin-btn bg-blue-600 hover:bg-blue-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                        Ver Documentos
                                    </button>
                                    
                                    <button onclick="updateCreditStatus(<?php echo $analysis['id']; ?>, 'pending')" class="admin-btn bg-yellow-600 hover:bg-yellow-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Pendente
                                    </button>
                                    
                                    <button onclick="updateCreditStatus(<?php echo $analysis['id']; ?>, 'approved')" class="admin-btn bg-green-600 hover:bg-green-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Aprovado
                                    </button>
                                    
                                    <button onclick="updateCreditStatus(<?php echo $analysis['id']; ?>, 'rejected')" class="admin-btn bg-red-600 hover:bg-red-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                        Rejeitado
                                    </button>
                                    
                                    <button onclick="unconfirmCreditAnalysis(<?php echo $analysis['id']; ?>)" class="admin-btn bg-gray-600 hover:bg-gray-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                        Desmarcar Análise
                                    </button>
                                    
                                    <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                        <!-- Botão deletar apenas para administrativos -->
                                        <button onclick="deleteCreditAnalysis(<?php echo $analysis['id']; ?>)" class="admin-btn bg-red-800 hover:bg-red-900">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                            Deletar
                                        </button>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <!-- Botão Ver Documentos antes de Confirmar Análise quando não confirmado -->
                                    <button onclick="viewCreditDocuments(<?php echo $analysis['id']; ?>)" class="admin-btn bg-blue-600 hover:bg-blue-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                        Ver Documentos
                                    </button>
                                    
                                    <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                        <button onclick="deleteCreditAnalysis(<?php echo $analysis['id']; ?>)" class="admin-btn bg-red-800 hover:bg-red-900">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                            Deletar
                                        </button>
                                    <?php endif; ?>
                                    
                                    <!-- Mostrar apenas botão de confirmação em verde se não estiver confirmado -->
                                    <button onclick="confirmCreditAnalysis(<?php echo $analysis['id']; ?>)" class="admin-btn bg-green-600 hover:bg-green-700">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Confirmar Análise de Crédito
                                    </button>
                                <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Pass employee ID to JavaScript for API calls -->
    <script>
        window.employeeId = <?php echo json_encode($_SESSION['employee_id']); ?>;
        
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('active');
        }
        
        function switchTab(tab) {
            const tabActive = document.getElementById('tab-active');
            const tabClosed = document.getElementById('tab-closed');
            const tabCredit = document.getElementById('tab-credit');
            const contentActive = document.getElementById('content-active');
            const contentClosed = document.getElementById('content-closed');
            const contentCredit = document.getElementById('content-credit');
            
            // Save current tab to localStorage
            localStorage.setItem('activeTab', tab);
            
            // Remove active classes from all tabs
            [tabActive, tabClosed, tabCredit].forEach(t => {
                t.classList.remove('active');
            });
            
            // Hide all content
            [contentActive, contentClosed, contentCredit].forEach(c => {
                c.style.display = 'none';
            });
            
            // Show selected tab
            if (tab === 'active') {
                tabActive.classList.add('active');
                contentActive.style.display = 'block';
            } else if (tab === 'closed') {
                tabClosed.classList.add('active');
                contentClosed.style.display = 'block';
            } else if (tab === 'credit') {
                tabCredit.classList.add('active');
                contentCredit.style.display = 'block';
            }
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            const savedTab = localStorage.getItem('activeTab') || 'active';
            switchTab(savedTab);
        });
        
        function toggleDocuments(analysisId) {
            const container = document.getElementById('documents-' + analysisId);
            const arrow = document.getElementById('doc-arrow-' + analysisId);
            
            if (container.style.display === 'none') {
                container.style.display = 'block';
                arrow.style.transform = 'rotate(90deg)';
            } else {
                container.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        }
        
        async function updateCreditAnalysisStatus(id, status) {
            if (!confirm(`Confirmar ${status === 'approved' ? 'aprovação' : 'rejeição'} desta análise de crédito?`)) {
                return;
            }
            
            try {
                const response = await fetch('../api/credit-analysis.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id, status })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Status atualizado com sucesso!');
                    location.reload();
                } else {
                    alert('Erro ao atualizar status: ' + result.message);
                }
            } catch (error) {
                console.error('[v0] Error updating status:', error);
                alert('Erro ao atualizar status. Tente novamente.');
            }
        }

        async function confirmCreditAnalysis(analysisId) {
            // Fetch employee list only if not already loaded
            if (typeof allEmployees === 'undefined' || allEmployees.length === 0) {
                await loadEmployees();
            }

            if (typeof allEmployees === 'undefined' || allEmployees.length === 0) {
                alert('Nenhum funcionário encontrado no sistema.');
                return;
            }

            const employeeButtons = allEmployees.map(employee => {
                const safeName = employee.name.replace(/'/g, "\\'");
                return '<button onclick="showCreditStatusModal(' + analysisId + ',' + employee.id + ',\'' + safeName + '\')" class="employee-selection-button">' +
                       '<div class="employee-info">' +
                       '<div class="employee-name">' + employee.name + '</div>' +
                       '<div class="employee-details">' + (employee.role || 'Funcionário') + ' - ' + employee.email + '</div>' +
                       '</div>' +
                       '</button>';
            }).join('');

            const modalHTML = '<div class="modal-overlay" onclick="closeModal()">' +
                '<div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">' +
                '<h2>Selecione o Funcionário</h2>' +
                '<p class="modal-subtitle">Escolha quem irá realizar esta análise de crédito:</p>' +
                '<div class="employee-selection-grid">' + employeeButtons + '</div>' +
                '<div class="modal-actions">' +
                '<button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>' +
                '</div>' +
                '</div>' +
                '</div>';

            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        async function updateCreditAnalysisWithEmployee(analysisId, employeeId, status, employeeName) {
            const statusTexts = {
                'pending': 'Pendente',
                'approved': 'Aprovado',
                'rejected': 'Recusado'
            };

            if (!confirm('Confirmar status "' + statusTexts[status] + '" para esta análise de crédito?')) {
                return;
            }

            try {
                const response = await fetch('../api/credit-analysis.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        id: analysisId, 
                        status: status,
                        analyzed_by: employeeId
                    })
                });

                const result = await response.json();

                if (result.success) {
                    closeModal();
                    alert('Análise de crédito confirmada por ' + employeeName + ' com status: ' + statusTexts[status]);
                    location.reload();
                } else {
                    alert('Erro ao atualizar análise: ' + result.message);
                }
            } catch (error) {
                console.error('[v0] Erro ao atualizar análise:', error);
                alert('Erro ao atualizar análise. Tente novamente.');
            }
        }

        function viewCreditDocuments(analysisId) {
            fetch('../api/credit-analysis.php?id=' + analysisId)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data) {
                        const analysis = data.data;
                        let documentsHTML = '';

                        if (analysis.doc_identidade) {
                            documentsHTML += '<div class="doc-item">' +
                                '<a href="../uploads/credit-analysis/' + analysis.doc_identidade + '" target="_blank" class="doc-link">' +
                                '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>' +
                                '</svg>' +
                                'CPF e RG/CNH' +
                                '</a>' +
                                '</div>';
                        }

                        if (analysis.doc_endereco) {
                            documentsHTML += '<div class="doc-item">' +
                                '<a href="../uploads/credit-analysis/' + analysis.doc_endereco + '" target="_blank" class="doc-link">' +
                                '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>' +
                                '</svg>' +
                                'Comprovante de Endereço' +
                                '</a>' +
                                '</div>';
                        }

                        if (analysis.doc_renda) {
                            documentsHTML += '<div class="doc-item">' +
                                '<a href="../uploads/credit-analysis/' + analysis.doc_renda + '" target="_blank" class="doc-link">' +
                                '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>' +
                                '</svg>' +
                                'Comprovante de Renda' +
                                '</a>' +
                                '</div>';
                        }

                        if (analysis.doc_bancario) {
                            documentsHTML += '<div class="doc-item">' +
                                '<a href="../uploads/credit-analysis/' + analysis.doc_bancario + '" target="_blank" class="doc-link">' +
                                '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>' +
                                '</svg>' +
                                'Dados Bancários' +
                                '</a>' +
                                '</div>';
                        }

                        if (!documentsHTML) {
                            documentsHTML = '<p class="text-gray-500 text-center py-4">Nenhum documento enviado</p>';
                        }

                        const modalHTML = '<div class="modal-overlay" onclick="closeModal()">' +
                            '<div class="modal-content documents-modal" onclick="event.stopPropagation()">' +
                            '<h2>Documentos da Análise de Crédito</h2>' +
                            '<p class="modal-subtitle">Telefone: ' + analysis.phone + '</p>' +
                            '<div class="documents-grid">' + documentsHTML + '</div>' +
                            '<div class="modal-actions">' +
                            '<button onclick="closeModal()" class="btn btn-secondary">Fechar</button>' +
                            '</div>' +
                            '</div>' +
                            '</div>';

                        document.body.insertAdjacentHTML('beforeend', modalHTML);
                    } else {
                        alert('Erro ao carregar documentos');
                    }
                })
                .catch(error => {
                    console.error('[v0] Erro ao carregar documentos:', error);
                    alert('Erro ao carregar documentos');
                });
        }
        
        // Function to toggle document visibility
        function toggleDocuments(id) {
            const documentsDiv = document.getElementById(`documents-${id}`);
            const arrowIcon = document.getElementById(`doc-arrow-${id}`);
            
            if (documentsDiv.style.display === 'none' || documentsDiv.style.display === '') {
                documentsDiv.style.display = 'block';
                arrowIcon.style.transform = 'rotate(90deg)'; // Rotate arrow
            } else {
                documentsDiv.style.display = 'none';
                arrowIcon.style.transform = 'rotate(0deg)'; // Reset arrow rotation
            }
        }

        function closeModal() {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.remove();
            }
        }
    </script>
    <script src="../assets/js/dashboard-admin.js"></script>
</body>
</html>
