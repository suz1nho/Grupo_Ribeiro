<?php
session_start();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grupo Ribeiro - Sistema de Gestão</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .home-container {
            max-width: 1000px;
            width: 100%;
        }

        .logo-header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .logo-header img {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            margin-bottom: 1.5rem;
            border: 4px solid rgba(255, 255, 255, 0.1);
        }

        .logo-header h1 {
            color: white;
            font-size: 2.8rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .logo-header p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.2rem;
            font-weight: 300;
        }

        .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .option-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 24px;
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transition: all 0.4s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .option-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            transition: height 0.3s ease;
        }

        .option-card.register::before {
            background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
        }

        .option-card.admin::before {
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .option-card:hover {
            transform: translateY(-12px);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
        }

        .option-card:hover::before {
            height: 6px;
        }

        .option-icon {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            font-size: 2.5rem;
        }

        .option-card.register .option-icon {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }

        .option-card.admin .option-icon {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }

        .option-card h2 {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #111827;
        }

        .option-card p {
            font-size: 1rem;
            color: #6b7280;
            line-height: 1.7;
            max-width: 280px;
        }

        .footer-text {
            text-align: center;
            margin-top: 3rem;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .logo-header h1 {
                font-size: 2rem;
            }

            .options-grid {
                grid-template-columns: 1fr;
            }

            .option-card {
                padding: 2rem 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="home-container">
        <div class="logo-header">
            <img src="../public/logo.jpeg" alt="Grupo Ribeiro Logo">
            <h1>Grupo Ribeiro</h1>
            <p>Sistema de Gestão Empresarial</p>
        </div>

        <div class="options-grid">
            <a href="register.php" class="option-card register">
                <div class="option-icon">
                    <svg fill="white" viewBox="0 0 24 24" width="48" height="48">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <h2>Cadastrar Funcionário</h2>
                <p>Registre novos funcionários no sistema com todas as informações necessárias</p>
            </a>

            <a href="index.php" class="option-card admin">
                <div class="option-icon">
                    <svg fill="white" viewBox="0 0 24 24" width="48" height="48">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                </div>
                <h2>Painel Administrativo</h2>
                <p>Acesse o painel administrativo para gerenciar agendamentos e análises</p>
            </a>
        </div>

        <div class="footer-text">
            <p>&copy; <?php echo date('Y'); ?> Grupo Ribeiro. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
