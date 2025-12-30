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
    
    $stmt = $db->query("SELECT COUNT(*) as total FROM appointments WHERE status NOT IN ('pending', 'scheduled')");
    $contractsClosed = $stmt->fetch()['total'] ?? 0;
    
    $confirmationRate = $totalAppointments > 0 ? round(($confirmedAppointments / $totalAppointments) * 100) : 0;
    
    $stmt = $db->query("SELECT a.*, e.name as confirmed_by_name FROM appointments a LEFT JOIN employees e ON a.confirmed_by = e.id ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT 50");
    $recentAppointments = $stmt->fetchAll();
    
} catch (PDOException $e) {
    error_log($e->getMessage());
    $totalAppointments = 0;
    $confirmedAppointments = 0;
    $contractsClosed = 0;
    $confirmationRate = 0;
    $recentAppointments = [];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body class="bg-background min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header matching admin.png design -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                <p class="text-gray-600 mt-1">Logado como: <span class="text-blue-600"><?php echo htmlspecialchars($_SESSION['employee_name']); ?></span> (<?php echo htmlspecialchars($_SESSION['employee_role'] ?? 'Administrativo'); ?>)</p>
            </div>
            <div class="flex gap-3">
                <a href="rank.php" class="admin-btn bg-yellow-600 hover:bg-yellow-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Ver Ranking
                </a>
                <a href="logout.php" class="admin-btn-outline">
                    Sair
                </a>
            </div>
        </div>

        <!-- Stats cards matching admin.png with exact colors -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <!-- Total de Agendamentos - Blue -->
            <div class="stats-card bg-blue-50 border-blue-200">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-600 text-sm mb-2">Total de Agendamentos</p>
                        <p class="text-4xl font-bold text-blue-900"><?php echo $totalAppointments; ?></p>
                    </div>
                    <svg class="icon-small text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
            </div>

            <!-- Confirmados - Green -->
            <div class="stats-card bg-green-50 border-green-200">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-600 text-sm mb-2">Confirmados</p>
                        <p class="text-4xl font-bold text-green-600"><?php echo $confirmedAppointments; ?></p>
                    </div>
                    <svg class="icon-small text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>

            <!-- Contratos Fechados - Purple -->
            <div class="stats-card bg-purple-50 border-purple-200">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-600 text-sm mb-2">Contratos Fechados</p>
                        <p class="text-4xl font-bold text-purple-600"><?php echo $contractsClosed; ?></p>
                    </div>
                    <svg class="icon-small text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
            </div>

            <!-- Taxa Confirmação - Red -->
            <div class="stats-card bg-red-50 border-red-200">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-600 text-sm mb-2">Taxa Confirmação</p>
                        <p class="text-4xl font-bold text-red-600"><?php echo $confirmationRate; ?>%</p>
                    </div>
                    <svg class="icon-small text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
            </div>
        </div>

        <!-- Appointments list section matching admin.png -->
        <div class="admin-card">
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
                                </div>

                                <div class="space-y-3">
                                    <!-- Nome -->
                                    <div class="flex items-center gap-3">
                                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        <div>
                                            <p class="text-xs text-gray-600">Nome</p>
                                            <p class="font-semibold text-gray-900"><?php echo htmlspecialchars($appointment['name']); ?></p>
                                        </div>
                                    </div>
                                    
                                    <!-- Email -->
                                    <div class="flex items-center gap-3">
                                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
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

                            <!-- Action buttons -->
                            <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <?php if ($appointment['status'] !== 'confirmed'): ?>
                                    <!-- Changed to call new showEmployeeSelection function -->
                                    <button onclick="showEmployeeSelection(<?php echo $appointment['id']; ?>)" class="admin-btn bg-green-500">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Confirmar Presença
                                    </button>
                                <?php endif; ?>
                                
                                <?php if ($_SESSION['employee_role'] === 'Administrativo'): ?>
                                    <button onclick="deleteAppointment(<?php echo $appointment['id']; ?>)" class="admin-btn bg-red-500">
                                        Deletar
                                    </button>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

        <!-- Instructions section matching admin.png -->
        <div class="admin-card mt-8 bg-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Instruções:</h3>
            <ul class="space-y-2 text-gray-700 text-sm">
                <li>• Clique em "Confirmar Presença" e digite o nome de quem atenderá (sugestões aparecem automaticamente)</li>
                <li>• Quando confirmado, o horário fica marcado com "X" vermelho no calendário do cliente</li>
                <li>• Apenas o funcionário que confirmou pode desconfirmar, imprimir e marcar contrato</li>
                <li>• Após confirmação, clique em "Marcar Contrato" para registrar que o contrato foi fechado</li>
                <li>• Clique em "Imprimir" para imprimir os dados do agendamento (inclui contrato feito)</li>
                <li>• Somente administradores com cargo "Administrativo" podem deletar agendamentos</li>
            </ul>
        </div>
    </div>

    <!-- Pass employee ID to JavaScript for API calls -->
    <script>
        window.employeeId = <?php echo json_encode($_SESSION['employee_id']); ?>;
    </script>
    <script src="../assets/js/dashboard-admin.js"></script>
</body>
</html>
