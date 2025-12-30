<?php
session_start();
require_once __DIR__ . '/../config/database.php';

$success = '';
$error = '';
$employees = [];

$db = Database::getInstance()->getConnection();

$searchTerm = trim($_GET['search'] ?? '');

try {
    if (!empty($searchTerm)) {
        $stmt = $db->prepare("SELECT id, name, email, cpf, phone, role, hired_date, status, password FROM employees WHERE name LIKE ? OR cpf LIKE ? OR role LIKE ? ORDER BY created_at DESC");
        $searchParam = "%{$searchTerm}%";
        $stmt->execute([$searchParam, $searchParam, $searchParam]);
    } else {
        $stmt = $db->query("SELECT id, name, email, cpf, phone, role, hired_date, status, password FROM employees ORDER BY created_at DESC");
    }
    $employees = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log($e->getMessage());
}

function formatCPF($cpf) {
    $cpf = preg_replace('/\D/', '', $cpf);
    return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf);
}

function maskPassword($password) {
    return str_repeat('*', min(strlen($password), 8));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $cpf = preg_replace('/\D/', '', $_POST['cpf'] ?? '');
    $phone = preg_replace('/\D/', '', $_POST['phone'] ?? '');
    $birth_date = $_POST['birth_date'] ?? '';
    $address = trim($_POST['address'] ?? '');
    $emergency_contact = trim($_POST['emergency_contact'] ?? '');
    $role = trim($_POST['role'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($name) || empty($email) || empty($cpf) || empty($phone) || empty($role) || empty($password)) {
        $error = 'Por favor, preencha todos os campos obrigatórios.';
    } else {
        try {
            // Check if employee already exists
            $stmt = $db->prepare("SELECT id FROM employees WHERE email = ? OR cpf = ?");
            $stmt->execute([$email, $cpf]);
            if ($stmt->fetch()) {
                $error = 'Funcionário já cadastrado com este email ou CPF.';
            } else {
                // Insert new employee
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $db->prepare("INSERT INTO employees (name, email, cpf, phone, birth_date, address, emergency_contact, role, password, status, hired_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURDATE())");
                $stmt->execute([$name, $email, $cpf, $phone, $birth_date, $address, $emergency_contact, $role, $hashedPassword]);
                
                $success = 'Funcionário cadastrado com sucesso!';
                
                // Reload employees list
                $stmt = $db->query("SELECT id, name, email, cpf, phone, role, hired_date, status, password FROM employees ORDER BY created_at DESC");
                $employees = $stmt->fetchAll();
            }
        } catch (PDOException $e) {
            $error = 'Erro ao cadastrar funcionário. Tente novamente.';
            $error = $e;
            // error_log($e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Funcionários</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f9fafb;
            padding: 2rem;
        }

        .page-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .page-title h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.25rem;
        }

        .page-title p {
            color: #6b7280;
            font-size: 0.9rem;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #6b7280;
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.3s;
        }

        .back-link:hover {
            color: #111827;
        }

        .btn {
            padding: 0.625rem 1.25rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            border: none;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #2563eb;
            color: white;
        }

        .btn-primary:hover {
            background: #1d4ed8;
        }

        .form-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }

        .form-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 1.5rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-group.full-width {
            grid-column: 1 / -1;
        }

        .form-group label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }

        .form-group label span {
            color: #ef4444;
        }

        .form-group input,
        .form-group select {
            padding: 0.625rem 0.875rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.95rem;
            transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #2563eb;
        }

        .form-group input::placeholder {
            color: #9ca3af;
        }

        .form-help {
            font-size: 0.8rem;
            color: #6b7280;
            margin-top: 0.25rem;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
        }

        .btn-cancel {
            background: #f3f4f6;
            color: #374151;
        }

        .btn-cancel:hover {
            background: #e5e7eb;
        }

        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
        }

        .alert-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        .employees-list {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            color: #9ca3af;
        }

        .employee-item {
            padding: 1.25rem;
            border-bottom: 1px solid #e5e7eb;
            display: grid;
            grid-template-columns: 2fr 1.5fr 1.5fr 1fr 120px;
            gap: 1.5rem;
            align-items: center;
        }

        .employee-item:last-child {
            border-bottom: none;
        }

        .employee-name {
            font-weight: 600;
            color: #111827;
            font-size: 1rem;
        }

        .employee-email {
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }

        .employee-info {
            color: #6b7280;
            font-size: 0.9rem;
        }

        .badge {
            display: inline-block;
            padding: 0.375rem 0.875rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .badge-active {
            background: #d1fae5;
            color: #065f46;
        }

        .btn-view-more {
            padding: 0.5rem 1rem;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }

        .btn-view-more:hover {
            background: #e5e7eb;
            border-color: #9ca3af;
        }

        .modal {
            display: none;
            role: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
        }

        .btn-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 0.25rem;
        }

        .modal-detail {
            margin-bottom: 1rem;
        }

        .modal-detail-label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }

        .modal-detail-value {
            color: #6b7280;
            font-size: 0.95rem;
        }

        .search-container {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .search-input {
            flex: 1;
            padding: 0.625rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.95rem;
        }

        .search-input:focus {
            outline: none;
            border-color: #2563eb;
        }

        .btn-search {
            padding: 0.625rem 1.5rem;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-search:hover {
            background: #1d4ed8;
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }

            .employee-item {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }

            .search-container {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="page-header">
            <div class="page-title">
                <h1>Gestão de Funcionários</h1>
                <p>Total: <?php echo count($employees); ?> funcionários cadastrados</p>
            </div>
            <a href="home.php" class="back-link">
                ← Voltar
            </a>
        </div>

        <div class="form-card">
            <h2 class="form-title">Cadastrar Novo Funcionário</h2>

            <?php if ($success): ?>
                <div class="alert alert-success">
                    <?php echo htmlspecialchars($success); ?>
                </div>
            <?php endif; ?>

            <?php if ($error): ?>
                <div class="alert alert-error">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="" id="register-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="name">Nome Completo <span>*</span></label>
                        <input type="text" id="name" name="name" required placeholder="Digite o nome completo">
                    </div>

                    <div class="form-group">
                        <label for="phone">Telefone <span>*</span></label>
                        <input type="tel" id="phone" name="phone" required placeholder="(XX) XXXXX-XXXX">
                    </div>

                    <div class="form-group">
                        <label for="email">Email <span>*</span></label>
                        <input type="email" id="email" name="email" required placeholder="email@exemplo.com">
                    </div>

                    <div class="form-group">
                        <label for="cpf">CPF <span>*</span></label>
                        <input type="text" id="cpf" name="cpf" required placeholder="XXX.XXX.XXX-XX">
                    </div>

                    <div class="form-group">
                        <label for="birth_date">Data de Nascimento</label>
                        <input type="date" id="birth_date" name="birth_date">
                    </div>

                    <div class="form-group">
                        <label for="emergency_contact">Contato de Emergência</label>
                        <input type="text" id="emergency_contact" name="emergency_contact" placeholder="Nome e telefone">
                    </div>

                    <div class="form-group full-width">
                        <label for="address">Endereço</label>
                        <input type="text" id="address" name="address" placeholder="Rua, número, bairro, cidade">
                    </div>

                    <div class="form-group">
                        <label for="role">Cargo <span>*</span></label>
                        <select id="role" name="role" required>
                            <option value="">Selecione um cargo</option>
                            <option value="Administrativo">Administrativo</option>
                            <option value="Vendedor">Vendedor</option>
                            <option value="Gerente">Gerente</option>
                            <option value="Analista">Analista</option>
                            <option value="Assistente">Assistente</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="password">Senha de Acesso <span>*</span></label>
                        <input type="password" id="password" name="password" required placeholder="Digite uma senha segura para acesso ao painel">
                        <div class="form-help">Esta senha será usada para acessar o painel administrativo</div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-cancel" onclick="document.getElementById('register-form').reset()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Adicionar Funcionário</button>
                </div>
            </form>
        </div>

        <div class="employees-list">
            <!-- Added search bar -->
            <div class="search-container">
                <input type="text" class="search-input" id="search-input" placeholder="Buscar por nome, CPF ou cargo..." value="<?php echo htmlspecialchars($searchTerm); ?>">
                <button type="button" class="btn-search" onclick="performSearch()">Buscar</button>
            </div>

            <?php if (empty($employees)): ?>
                <div class="empty-state">
                    Nenhum funcionário cadastrado
                </div>
            <?php else: ?>
                <!-- Updated employee list columns: nome, senha, cpf, cargo, ver mais -->
                <?php foreach ($employees as $employee): ?>
                    <div class="employee-item">
                        <div>
                            <div class="employee-name"><?php echo htmlspecialchars($employee['name']); ?></div>
                            <div class="employee-email"><?php echo htmlspecialchars($employee['email']); ?></div>
                        </div>
                        <div class="employee-info"><?php echo maskPassword($employee['password'] ?? '********'); ?></div>
                        <div class="employee-info"><?php echo formatCPF($employee['cpf']); ?></div>
                        <div class="employee-info"><?php echo htmlspecialchars($employee['role']); ?></div>
                        <div>
                            <button class="btn-view-more" onclick="viewEmployee(<?php echo $employee['id']; ?>)">Ver Mais</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>

    <!-- Modal for employee details -->
    <div class="modal" id="employee-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Detalhes do Funcionário</h3>
                <button class="btn-close" onclick="closeModal()">&times;</button>
            </div>
            <div id="modal-body">
                <!-- Details will be loaded here -->
            </div>
        </div>
    </div>

    <script src="../assets/js/register-admin.js"></script>
    <script>
        function performSearch() {
            const searchTerm = document.getElementById('search-input').value;
            window.location.href = `?search=${encodeURIComponent(searchTerm)}`;
        }

        // Allow search on Enter key
        document.getElementById('search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        async function viewEmployee(id) {
            const modal = document.getElementById('employee-modal');
            const modalBody = document.getElementById('modal-body');
            
            modalBody.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">Carregando...</p>';
            modal.classList.add('active');

            try {
                const response = await fetch(`../api/employees.php?id=${id}`);
                const data = await response.json();

                if (data.success && data.employee) {
                    const emp = data.employee;
                    modalBody.innerHTML = `
                        <div class="modal-detail">
                            <div class="modal-detail-label">Nome Completo</div>
                            <div class="modal-detail-value">${emp.name || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">Email</div>
                            <div class="modal-detail-value">${emp.email || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">CPF</div>
                            <div class="modal-detail-value">${emp.cpf || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">Telefone</div>
                            <div class="modal-detail-value">${emp.phone || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">Data de Nascimento</div>
                            <div class="modal-detail-value">${emp.birth_date || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">Endereço</div>
                            <div class="modal-detail-value">${emp.address || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">Contato de Emergência</div>
                            <div class="modal-detail-value">${emp.emergency_contact || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">Cargo</div>
                            <div class="modal-detail-value">${emp.role || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">Data de Contratação</div>
                            <div class="modal-detail-value">${emp.hired_date || '-'}</div>
                        </div>
                        <div class="modal-detail">
                            <div class="modal-detail-label">Status</div>
                            <div class="modal-detail-value">
                                <span class="badge badge-active">${emp.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                            </div>
                        </div>
                    `;
                } else {
                    modalBody.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ef4444;">Erro ao carregar detalhes do funcionário.</p>';
                }
            } catch (error) {
                modalBody.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ef4444;">Erro ao carregar detalhes do funcionário.</p>';
            }
        }

        function closeModal() {
            document.getElementById('employee-modal').classList.remove('active');
        }

        // Close modal on outside click
        document.getElementById('employee-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    </script>
</body>
</html>
