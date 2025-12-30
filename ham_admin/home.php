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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .home-container {
            max-width: 1200px;
            width: 100%;
        }

        .logo-header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .logo-header img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            margin-bottom: 1rem;
        }

        .logo-header h1 {
            color: white;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .logo-header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.2rem;
        }

        .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .option-card {
            background: white;
            border-radius: 20px;
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .option-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .option-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
        }

        .option-card.register .option-icon {
            color: #3b82f6;
        }

        .option-card.admin .option-icon {
            color: #f59e0b;
        }

        .option-card h2 {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #111827;
        }

        .option-card p {
            font-size: 1rem;
            color: #6b7280;
            line-height: 1.6;
        }

        @media (max-width: 768px) {
            .logo-header h1 {
                font-size: 2rem;
            }

            .options-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="home-container">
        <div class="logo-header">
            <img src="../public/logo.jpeg" alt="Grupo Ribeiro Logo">
            <h1>Grupo Ribeiro</h1>
            <p>Sistema de Gestão de Funcionários</p>
        </div>

        <div class="options-grid">
            <a href="register.php" class="option-card register">
                <div class="option-icon">👤</div>
                <h2>Cadastrar Funcionário</h2>
                <p>Registre novos funcionários no sistema com todas as informações necessárias</p>
            </a>

            <a href="index.php" class="option-card admin">
                <div class="option-icon">🔐</div>
                <h2>Painel Administrativo</h2>
                <p>Acesse o painel administrativo para gerenciar o sistema</p>
            </a>
        </div>
    </div>
</body>
</html>
