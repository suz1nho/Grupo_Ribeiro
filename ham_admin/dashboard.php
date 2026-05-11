<?php
session_start();
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['employee_id'])) {
    header('Location: index.php');
    exit;
}

$employeeData = [
    'id'    => $_SESSION['employee_id'],
    'name'  => htmlspecialchars($_SESSION['employee_name']),
    'email' => htmlspecialchars($_SESSION['employee_email']),
    'role'  => htmlspecialchars($_SESSION['employee_role'] ?? 'Administrativo'),
];

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("
        SELECT a.*, e.name AS confirmed_by_name
        FROM appointments a
        LEFT JOIN employees e ON a.confirmed_by = e.id
        WHERE a.status IS NULL OR a.status IN ('pending','confirmed','approved')
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 50
    ");
    $activeAppointments = $stmt->fetchAll();
} catch (Exception $e) {
    $activeAppointments = [];
    error_log($e->getMessage());
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
                <p>Logado como: <span class="user-name" id="userName"></span> (<span id="userRole"></span>)</p>
            </div>
            <div class="header-actions">
                <button id="mobile-menu-btn" class="mobile-menu-btn" onclick="toggleMobileMenu()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                    Menu
                </button>
                <a href="logout.php" class="btn-logout">Sair</a>
            </div>
        </div>

        <div id="statsGrid" class="stats-grid"></div>

        <div id="mobile-menu" class="mobile-menu-overlay">
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h2>Menu</h2>
                    <button onclick="toggleMobileMenu()" class="mobile-menu-close">&times;</button>
                </div>
                <div id="mobileStatsList" class="mobile-stats-list"></div>
            </div>
        </div>

        <div class="content-panel">
            <div class="tabs-nav">
                <button onclick="switchTab('active')" id="tab-active" class="tab-btn active">Agendamentos Ativos</button>
                <button onclick="switchTab('closed')" id="tab-closed" class="tab-btn">Contratos Fechados</button>
                <button onclick="switchTab('credit')" id="tab-credit" class="tab-btn">Análise de Crédito</button>
                <button onclick="switchTab('clients')" id="tab-clients" class="tab-btn">Clientes</button>
            </div>

            <div id="content-active" class="tab-content">
                <div id="server-side-active" style="display: none;">
                    <h3>Agendamentos Ativos (fallback)</h3>
                    <?php foreach ($activeAppointments as $app): ?>
                        <div class="appointment-card">
                            <div><strong><?php echo htmlspecialchars($app['name']); ?></strong> - <?php echo htmlspecialchars($app['appointment_date']); ?> - <?php echo htmlspecialchars($app['appointment_time']); ?></div>
                            <?php if (!empty($app['message'])): ?>
                                <div class="user-message"><strong>Mensagem do cliente:</strong> <?php echo nl2br(htmlspecialchars($app['message'])); ?></div>
                            <?php endif; ?>
                            <?php if (!empty($app['notes'])): ?>
                                <div class="employee-message-box">
                                    <p class="msg-label">Mensagem do Funcionário</p>
                                    <p class="msg-content"><?php echo nl2br(htmlspecialchars($app['notes'])); ?></p>
                                </div>
                            <?php endif; ?>
                            <div style="margin-top: 0.5rem; color: #6b7280; font-size: 0.8rem;">
                                Confirmação: <?php echo htmlspecialchars($app['confirmed_by_name']); ?>
                                &nbsp;|&nbsp;
                                <a href="mailto:<?php echo htmlspecialchars($app['email']); ?>?subject=Contato%20Grupo%20Ribeiro&body=Ol%C3%A1%20<?php echo urlencode($app['name']); ?>%2C" style="color:#2563eb;">Email</a>
                                &nbsp;|&nbsp;
                                <a href="https://wa.me/55<?php echo preg_replace('/\D/', '', $app['phone']); ?>?text=Ol%C3%A1%20<?php echo urlencode($app['name']); ?>%2C%20tudo%20bem%3F" style="color:#059669;" target="_blank">WhatsApp</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <div id="content-closed" class="tab-content" style="display:none;"></div>
            <div id="content-credit" class="tab-content" style="display:none;"></div>
            <div id="content-clients" class="tab-content" style="display:none;"></div>
        </div>
    </div>

    <script>
        window.addEventListener('load', function() {
            setTimeout(function() {
                var activeContent = document.getElementById('content-active');
                var fallback = document.getElementById('server-side-active');
                if (activeContent && fallback && activeContent.children.length <= 1) {
                    fallback.style.display = 'block';
                }
            }, 2000);
        });
    </script>

    <script>window.__EMPLOYEE__ = <?php echo json_encode($employeeData); ?>;</script>

    <!-- Load order: API -> Shared utilities -> Per-tab scripts -> Main app -->
    <script src="../assets/js/dashboard-api.js"></script>
    <script src="../assets/js/dashboard-tabs.js"></script>
    <script src="../assets/js/dashboard-active.js"></script>
    <script src="../assets/js/dashboard-closed.js"></script>
    <script src="../assets/js/dashboard-credit.js"></script>
    <script src="../assets/js/dashboard-clients.js"></script>
    <script src="../assets/js/dashboard-app.js"></script>
</body>
</html>
