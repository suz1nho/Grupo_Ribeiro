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
        <!-- Header -->
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

        <!-- Stats Grid -->
        <div id="statsGrid" class="stats-grid"></div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="mobile-menu-overlay">
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h2>Menu</h2>
                    <button onclick="toggleMobileMenu()" class="mobile-menu-close">&times;</button>
                </div>
                <div id="mobileStatsList" class="mobile-stats-list"></div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content-panel">
            <div class="tabs-nav">
                <button onclick="switchTab('active')" id="tab-active" class="tab-btn active">Agendamentos Ativos</button>
                <button onclick="switchTab('closed')" id="tab-closed" class="tab-btn">Contratos Fechados</button>
                <button onclick="switchTab('credit')" id="tab-credit" class="tab-btn">Análise de Crédito</button>
                <button onclick="switchTab('clients')" id="tab-clients" class="tab-btn">Clientes</button>
            </div>

            <div id="content-active" class="tab-content"></div>
            <div id="content-closed" class="tab-content" style="display:none;"></div>
            <div id="content-credit" class="tab-content" style="display:none;"></div>
            <div id="content-clients" class="tab-content" style="display:none;"></div>
        </div>
    </div>

    <!-- Employee data -->
    <script>window.__EMPLOYEE__ = <?php echo json_encode($employeeData); ?>;</script>

    <!-- JavaScript modules -->
    <script src="../assets/js/dashboard-api.js"></script>
    <script src="../assets/js/dashboard-tabs.js"></script>
    <script src="../assets/js/dashboard-app.js"></script>
</body>
</html>
