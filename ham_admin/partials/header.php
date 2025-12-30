<header class="admin-header">
    <div class="header-left">
        <h1><?php echo ucfirst(str_replace(['.php', '-'], ['', ' '], basename($_SERVER['PHP_SELF']))); ?></h1>
    </div>
    
    <div class="header-right">
        <div class="user-info">
            <span class="user-name"><?php echo htmlspecialchars($_SESSION['employee_name']); ?></span>
            <span class="user-role"><?php echo ucfirst($_SESSION['employee_role']); ?></span>
        </div>
        <div class="user-avatar">
            <?php echo strtoupper(substr($_SESSION['employee_name'], 0, 1)); ?>
        </div>
    </div>
</header>

<style>
.admin-header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 50;
}

.header-left h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    text-transform: capitalize;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
}

.user-role {
    font-size: 0.75rem;
    color: #6b7280;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.125rem;
}

.dashboard-container {
    padding: 2rem;
}

.dashboard-header {
    margin-bottom: 2rem;
}

.dashboard-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
}

.dashboard-header p {
    color: #6b7280;
    font-size: 1rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 2px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    font-size: 2.5rem;
    opacity: 0.7;
}

.stat-info h3 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
}

.stat-info p {
    font-size: 0.875rem;
    color: #6b7280;
}

.stat-card.pending .stat-icon {
    filter: hue-rotate(45deg);
}

.stat-card.success .stat-icon {
    filter: hue-rotate(100deg);
}

.stat-card.info .stat-icon {
    filter: hue-rotate(180deg);
}

.stat-card.warning .stat-icon {
    filter: hue-rotate(30deg);
}

.dashboard-content {
    display: grid;
    gap: 2rem;
}

.data-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
}

.data-section h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1rem;
}

.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    background: #f9fafb;
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #6b7280;
    font-size: 0.875rem;
    border-bottom: 1px solid #e5e7eb;
}

.data-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.875rem;
    color: #374151;
}

.badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.badge-pending {
    background: #fef3c7;
    color: #92400e;
}

.badge-confirmed {
    background: #d1fae5;
    color: #065f46;
}

.badge-cancelled {
    background: #fee2e2;
    color: #991b1b;
}

.badge-new {
    background: #dbeafe;
    color: #1e40af;
}

.badge-contacted {
    background: #e0e7ff;
    color: #3730a3;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-success {
    background: #10b981;
    color: white;
}

.btn-success:hover {
    background: #059669;
}
</style>
