<?php
session_start();
require_once __DIR__ . '/../config/database.php';

if (isset($_SESSION['employee_id'])) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($name) || empty($password)) {
        $error = 'Por favor, preencha todos os campos.';
    } else {
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT id, name, email, password, role, status FROM employees WHERE name = ?");
            $stmt->execute([$name]);
            $employee = $stmt->fetch();
            
            if ($employee && password_verify($password, $employee['password'])) {
                if ($employee['status'] !== 'active') {
                    $error = 'Sua conta está inativa. Contate o administrador.';
                } else {
                    $_SESSION['employee_id'] = $employee['id'];
                    $_SESSION['employee_name'] = $employee['name'];
                    $_SESSION['employee_email'] = $employee['email'];
                    $_SESSION['employee_role'] = $employee['role'];
                    
                    header('Location: dashboard.php');
                    exit;
                }
            } else {
                $error = 'Nome ou senha inválidos.';
            }
        } catch (PDOException $e) {
            $error = 'Erro ao processar login. Tente novamente.';
            error_log($e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Painel Administrativo</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .login-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 450px;
            width: 100%;
            padding: 3rem;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #6366f1;
            text-decoration: none;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            transition: color 0.3s;
        }

        .back-link:hover {
            color: #4f46e5;
        }

        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .login-logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 1rem;
        }

        .login-header h1 {
            font-size: 1.8rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
        }

        .login-header p {
            color: #6b7280;
            font-size: 0.95rem;
        }

        .alert {
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }

        .form-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #6366f1;
        }

        .btn {
            width: 100%;
            padding: 0.875rem;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }

        .btn:hover {
            background: #4f46e5;
        }

        .login-footer {
            text-align: center;
            margin-top: 2rem;
            color: #6b7280;
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <a href="home.php" class="back-link">
            ← Voltar
        </a>
        
        <div class="login-header">
            <img src="../public/logo.jpeg" alt="Grupo Ribeiro" class="login-logo">
            <h1>Painel Administrativo</h1>
            <p>Digite seu nome e senha de acesso</p>
        </div>
        
        <?php if ($error): ?>
            <div class="alert alert-error">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>
        
        <form method="POST" action="" class="login-form">
            <div class="form-group">
                <label for="name">Nome do Funcionário</label>
                <input type="text" id="name" name="name" required value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>" placeholder="Digite seu nome completo">
            </div>
            
            <div class="form-group">
                <label for="password">Senha de Acesso</label>
                <input type="password" id="password" name="password" required placeholder="Digite sua senha">
            </div>
            
            <button type="submit" class="btn">Entrar no Painel</button>
        </form>
        
        <div class="login-footer">
            <p>&copy; <?php echo date('Y'); ?> Grupo Ribeiro. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
