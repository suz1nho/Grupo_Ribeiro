<aside class="admin-sidebar">
    <div class="sidebar-header">
        <img src="../public/logo.jpeg" alt="Grupo Ribeiro" class="sidebar-logo">
        <h2>Admin Panel</h2>
    </div>
    
    <nav class="sidebar-nav">
        <a href="dashboard.php" class="nav-item <?php echo basename($_SERVER['PHP_SELF']) === 'dashboard.php' ? 'active' : ''; ?>">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Dashboard</span>
        </a>
        
        <a href="appointments.php" class="nav-item <?php echo basename($_SERVER['PHP_SELF']) === 'appointments.php' ? 'active' : ''; ?>">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>Agendamentos</span>
        </a>
        
        <a href="contacts.php" class="nav-item <?php echo basename($_SERVER['PHP_SELF']) === 'contacts.php' ? 'active' : ''; ?>">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span>Contatos</span>
        </a>
        
        <a href="credit-analysis.php" class="nav-item <?php echo basename($_SERVER['PHP_SELF']) === 'credit-analysis.php' ? 'active' : ''; ?>">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <span>Análises de Crédito</span>
        </a>
        
        <?php if ($_SESSION['employee_role'] === 'admin'): ?>
        <a href="rank.php" class="nav-item <?php echo basename($_SERVER['PHP_SELF']) === 'rank.php' ? 'active' : ''; ?>">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Ranking</span>
        </a>
        
        <a href="register.php" class="nav-item <?php echo basename($_SERVER['PHP_SELF']) === 'register.php' ? 'active' : ''; ?>">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            <span>Cadastrar Funcionário</span>
        </a>
        <?php endif; ?>
        
        <a href="logout.php" class="nav-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Sair</span>
        </a>
    </nav>
</aside>

<style>
.admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 260px;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    z-index: 100;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    text-align: center;
}

.sidebar-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin: 0 auto 0.5rem;
}

.sidebar-header h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #111827;
}

.sidebar-nav {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: #6b7280;
    text-decoration: none;
    border-radius: 8px;
    margin-bottom: 0.25rem;
    transition: all 0.2s ease;
    font-weight: 500;
}

.nav-item:hover {
    background: #f3f4f6;
    color: #111827;
}

.nav-item.active {
    background: #eff6ff;
    color: #3b82f6;
}

.main-content {
    margin-left: 260px;
    min-height: 100vh;
    background: #f5f7fa;
}

@media (max-width: 768px) {
    .admin-sidebar {
        width: 70px;
    }
    .sidebar-header h2, .nav-item span {
        display: none;
    }
    .main-content {
        margin-left: 70px;
    }
}
</style>
