
// Dashboard JavaScript

// Function to toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
}

// Function to switch between tabs
function switchTab(tab) {
    const tabActive = document.getElementById('tab-active');
    const tabClosed = document.getElementById('tab-closed');
    const tabCredit = document.getElementById('tab-credit');
    const tabClients = document.getElementById('tab-clients');
    const contentActive = document.getElementById('content-active');
    const contentClosed = document.getElementById('content-closed');
    const contentCredit = document.getElementById('content-credit');
    const contentClients = document.getElementById('content-clients');
    
    // Save current tab to localStorage
    localStorage.setItem('activeTab', tab);
    
    // Remove active classes from all tabs
    [tabActive, tabClosed, tabCredit, tabClients].forEach(t => {
        t.classList.remove('active');
    });
    
    // Hide all content
    [contentActive, contentClosed, contentCredit, contentClients].forEach(c => {
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
    } else if (tab === 'clients') {
        tabClients.classList.add('active');
        contentClients.style.display = 'block';
    }
}

// Initialize tab switching on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTab = localStorage.getItem('activeTab') || 'active';
    switchTab(savedTab);
});

// Function to toggle document visibility
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

// Function to close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
}

// Global variables
const API_BASE_URL = "../api";
let allEmployees = [];

// Load employees list
async function loadEmployees() {
    try {
        const response = await fetch('../api/employees.php');
        const data = await response.json();

        if (data.success && data.data) {
            allEmployees = data.data;
        } else {
            allEmployees = [];
        }
    } catch (error) {
        console.error('[v0] Erro ao carregar funcionários:', error);
        allEmployees = [];
    }
}

// Confirm appointment
async function confirmAppointment(id) {
    showEmployeeSelection(id);
}

// Unconfirm appointment
async function unconfirmAppointment(appointmentId) {
    if (!confirm("Tem certeza que deseja desconfirmar este agendamento?")) {
        return;
    }

    try {
        const response = await fetch('../api/appointments.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: appointmentId,
                status: 'pending',
                confirmed_by: null,
            }),
        });

        const result = await response.json();

        if (result.success) {
            alert('Agendamento desconfirmado com sucesso!');
            location.reload();
        } else {
            alert('Erro ao desconfirmar agendamento: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao desconfirmar agendamento:', error);
        alert('Erro ao desconfirmar agendamento. Tente novamente.');
    }
}

// Delete appointment
async function deleteAppointment(id) {
    if (!confirm("Tem certeza que deseja deletar este agendamento?")) {
        return;
    }

    try {
        const response = await fetch('../api/appointments.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id }),
        });

        const result = await response.json();

        if (result.success) {
            alert('Agendamento deletado com sucesso!');
            location.reload();
        } else {
            alert('Erro ao deletar agendamento: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao deletar agendamento:', error);
        alert('Erro ao deletar agendamento. Tente novamente.');
    }
}

// Show employee selection modal
async function showEmployeeSelection(appointmentId) {
    if (allEmployees.length === 0) {
        await loadEmployees();
    }

    if (allEmployees.length === 0) {
        alert('Nenhum funcionário encontrado no sistema.');
        return;
    }

    const employeeButtons = allEmployees.map(employee => {
        const safeName = employee.name.replace(/'/g, "\\'");
        return '<button onclick="confirmAppointmentWithEmployee(' + appointmentId + ',' + employee.id + ',\'' + safeName + '\')" class="employee-selection-button">' +
               '<div class="employee-info">' +
               '<div class="employee-name">' + employee.name + '</div>' +
               '<div class="employee-details">' + (employee.role || 'Funcionário') + ' - ' + employee.email + '</div>' +
               '</div>' +
               '</button>';
    }).join('');

    const modalHTML = '<div class="modal-overlay" onclick="closeModal()">' +
        '<div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">' +
        '<h2>Selecione o Funcionário</h2>' +
        '<p class="modal-subtitle">Escolha quem irá atender este agendamento (' + allEmployees.length + ' funcionários disponíveis):</p>' +
        '<div class="employee-selection-grid">' + employeeButtons + '</div>' +
        '<div class="modal-actions">' +
        '<button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>' +
        '</div>' +
        '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Confirm appointment with selected employee
async function confirmAppointmentWithEmployee(appointmentId, employeeId, employeeName) {
    try {
        const appointmentResponse = await fetch('../api/appointments.php?id=' + appointmentId);
        const appointmentData = await appointmentResponse.json();

        if (!appointmentData.success || !appointmentData.data) {
            alert('Erro ao buscar dados do agendamento');
            return;
        }

        const appointment = appointmentData.data;

        const response = await fetch('../api/appointments.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: appointmentId,
                status: 'approved',
                confirmed_by: employeeId,
            }),
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            sendWhatsAppMessage(appointment, employeeName);
            alert('Agendamento confirmado por ' + employeeName + '!');
            location.reload();
        } else {
            alert('Erro ao confirmar agendamento: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao confirmar agendamento:', error);
        alert('Erro ao confirmar agendamento. Tente novamente.');
    }
}

// Send WhatsApp message
function sendWhatsAppMessage(appointment, employeeName) {
    // Format appointment date
    const appointmentDate = new Date(appointment.appointment_date + 'T00:00:00');
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    // Format time
    const formattedTime = appointment.appointment_time;

    // Create message
    const message = `Olá, ${appointment.name}! O seu agendamento foi confirmado para o dia ${formattedDate} no horário ${formattedTime}. Aguardamos você!`;

    // Clean phone number
    const cleanPhone = appointment.phone.replace(/\D/g, '');

    // Add country code if needed
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const whatsappURL = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
}

// Mark contract as closed
async function markContract(appointmentId) {
    if (!confirm('Confirmar que o contrato foi fechado?')) {
        return;
    }

    try {
        const response = await fetch('../api/appointments.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: appointmentId,
                status: 'closed',
                contract_closed_by: window.employeeId,
            }),
        });

        const result = await response.json();

        if (result.success) {
            alert('Contrato marcado como fechado! O horário ficará disponível novamente.');
            location.reload();
        } else {
            alert('Erro ao marcar contrato: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao marcar contrato:', error);
        alert('Erro ao marcar contrato. Tente novamente.');
    }
}

// Print appointment
function printAppointment(appointmentId) {
    fetch('../api/appointments.php?id=' + appointmentId)
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                const apt = response.data;
                const printWindow = window.open('', '_blank');

                const html =
                    '<!DOCTYPE html>' +
                    '<html>' +
                    '<head>' +
                    '<title>Agendamento - ' + apt.name + '</title>' +
                    '<style>' +
                    'body { font-family: Arial, sans-serif; padding: 40px; }' +
                    'h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }' +
                    '.info { margin: 20px 0; }' +
                    '.info-row { display: flex; margin: 10px 0; }' +
                    '.label { font-weight: bold; width: 150px; }' +
                    '.value { color: #555; }' +
                    '.confirmed { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin-top: 20px; }' +
                    '.contract-closed { background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin-top: 20px; }' +
                    '@media print { body { padding: 20px; } }' +
                    '</style>' +
                    '</head>' +
                    '<body>' +
                    '<h1>Detalhes do Agendamento</h1>' +
                    '<div class="info">' +
                    '<div class="info-row"><span class="label">Nome:</span><span class="value">' + apt.name + '</span></div>' +
                    '<div class="info-row"><span class="label">Email:</span><span class="value">' + apt.email + '</span></div>' +
                    '<div class="info-row"><span class="label">Telefone:</span><span class="value">' + apt.phone + '</span></div>' +
                    '<div class="info-row"><span class="label">Data:</span><span class="value">' + formatDate(apt.appointment_date) + '</span></div>' +
                    '<div class="info-row"><span class="label">Horário:</span><span class="value">' + apt.appointment_time + '</span></div>' +
                    (apt.confirmed_by_name
                        ? '<div class="confirmed"><strong>Presença Confirmada</strong><br>Atendente: ' + apt.confirmed_by_name + '</div>'
                        : '') +
                    (apt.contract_status === 'closed'
                        ? '<div class="contract-closed"><strong>Contrato Fechado</strong></div>'
                        : '') +
                    '</div>' +
                    '</body>' +
                    '</html>';

                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            }
        })
        .catch(error => {
            alert('Erro ao buscar dados do agendamento');
            console.error(error);
        });
}

// Show notes modal
async function showNotesModal(appointmentId) {
    try {
        const response = await fetch('../api/appointments.php?id=' + appointmentId);
        const data = await response.json();

        let currentNotes = '';
        if (data.success && data.data) {
            currentNotes = data.data.notes || '';
        }

        const modalHTML =
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content notes-modal" onclick="event.stopPropagation()">' +
            '<h2>Informações do Agendamento</h2>' +
            '<p class="modal-subtitle">Adicione anotações importantes sobre este agendamento:</p>' +
            '<div class="notes-container">' +
            '<textarea id="appointmentNotes" class="notes-textarea" placeholder="Digite suas anotações aqui..." rows="10">' + currentNotes + '</textarea>' +
            '</div>' +
            '<div class="modal-actions">' +
            '<button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>' +
            '<button onclick="saveNotes(' + appointmentId + ')" class="btn btn-primary">Salvar</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        setTimeout(() => {
            const textarea = document.getElementById('appointmentNotes');
            if (textarea) {
                textarea.focus();
            }
        }, 100);
    } catch (error) {
        console.error('[v0] Erro ao carregar notas:', error);
        alert('Erro ao carregar notas. Tente novamente.');
    }
}

// Save notes
async function saveNotes(appointmentId) {
    const notes = document.getElementById('appointmentNotes').value;

    try {
        const response = await fetch('../api/appointments.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: appointmentId,
                notes: notes,
            }),
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            alert('Anotações salvas com sucesso!');
            location.reload();
        } else {
            alert('Erro ao salvar anotações: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao salvar notas:', error);
        alert('Erro ao salvar anotações. Tente novamente.');
    }
}

// Confirm credit analysis
async function confirmCreditAnalysis(analysisId) {
    try {
        const response = await fetch('../api/credit-analysis.php?action=employees');
        const data = await response.json();

        if (!data.success || !data.data) {
            alert('Erro ao carregar funcionários');
            return;
        }

        const employees = data.data;

        // Create employee selection modal
        const modalHTML =
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">' +
            '<h2>Selecionar Funcionário Responsável</h2>' +
            '<p class="modal-subtitle">Escolha o funcionário que será responsável por esta análise de crédito:</p>' +
            '<div class="employee-selection-grid">' +
            employees.map(emp =>
                '<button class="employee-selection-button" onclick="executeCreditConfirmation(' + analysisId + ', ' + emp.id + ')">' +
                '<div class="employee-info">' +
                '<div class="employee-name">' + emp.name + '</div>' +
                '<div class="employee-details">' + (emp.role || 'Funcionário') + '</div>' +
                '</div>' +
                '</button>'
            ).join('') +
            '</div>' +
            '<div class="modal-actions">' +
            '<button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('[v0] Erro ao carregar funcionários:', error);
        alert('Erro ao carregar funcionários. Tente novamente.');
    }
}

// Execute credit confirmation
async function executeCreditConfirmation(analysisId, employeeId) {
    closeModal();

    try {
        const analysisResponse = await fetch('../api/credit-analysis.php?id=' + analysisId);
        const analysisData = await analysisResponse.json();

        if (!analysisData.success || !analysisData.data) {
            alert('Erro ao buscar dados da análise de crédito');
            return;
        }

        const analysis = analysisData.data;

        const response = await fetch('../api/credit-analysis.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: analysisId,
                status: 'approved',
                analyzed_by: employeeId,
            }),
        });

        const result = await response.json();

        if (result.success) {
            sendCreditAnalysisWhatsAppMessage(analysis);
            alert('Análise de crédito confirmada com sucesso!');
            location.reload();
        } else {
            alert('Erro ao confirmar análise: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao confirmar análise:', error);
        alert('Erro ao confirmar análise. Tente novamente.');
    }
}

// Send credit analysis WhatsApp message
function sendCreditAnalysisWhatsAppMessage(analysis) {
    // Format requested amount
    const formattedAmount = Number.parseFloat(analysis.requested_amount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    // Create message
    const message = `Olá, ${analysis.name}! A sua análise de crédito foi confirmada! ✅

Valor solicitado: ${formattedAmount}

Entre em contato conosco para darmos continuidade ao seu processo. Aguardamos você!`;

    // Clean phone number
    const cleanPhone = analysis.phone.replace(/\D/g, '');

    // Add country code if needed
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const whatsappURL = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');
}

// Update credit status
async function updateCreditStatus(analysisId, status) {
    const statusLabels = {
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
    };

    if (!confirm('Confirmar alteração do status para: ' + statusLabels[status] + '?')) {
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
            }),
        });

        const result = await response.json();

        if (result.success) {
            alert('Status atualizado com sucesso!');
            location.reload();
        } else {
            alert('Erro ao atualizar status: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao atualizar status:', error);
        alert('Erro ao atualizar status. Tente novamente.');
    }
}

// Unconfirm credit analysis
async function unconfirmCreditAnalysis(analysisId) {
    if (!confirm('Deseja desmarcar esta análise de crédito? O funcionário responsável será removido.')) {
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
                status: 'pending',
                analyzed_by: null,
            }),
        });

        const result = await response.json();

        if (result.success) {
            alert('Análise desmarcada com sucesso!');
            location.reload();
        } else {
            alert('Erro ao desmarcar análise: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao desmarcar análise:', error);
        alert('Erro ao desmarcar análise. Tente novamente.');
    }
}

// View credit documents
async function viewCreditDocuments(analysisId) {
    try {
        const response = await fetch('../api/credit-analysis.php?id=' + analysisId);
        const data = await response.json();

        if (!data.success || !data.data) {
            alert('Erro ao carregar documentos');
            return;
        }

        const analysis = data.data;

        // Helper function to generate document preview
        function getDocumentPreview(docPath, docName) {
            if (!docPath) {
                return (
                    '<div class="document-item no-doc">' +
                    '<span class="doc-label">' + docName + ':</span> ' +
                    '<span class="doc-status">Não enviado</span>' +
                    '</div>'
                );
            }

            const fullPath = '../uploads/credit-analysis/' + docPath;
            const ext = docPath.split('.').pop().toLowerCase();
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

            if (isImage) {
                return (
                    '<div class="document-item has-doc">' +
                    '<span class="doc-label">' + docName + ':</span>' +
                    '<div class="doc-image-container">' +
                    '<img src="' + fullPath + '" alt="' + docName + '" class="doc-thumbnail" onclick="openDocumentImage(\'' + fullPath + '\')">' +
                    '<a href="' + fullPath + '" target="_blank" class="doc-link-btn">Abrir em nova aba</a>' +
                    '</div>' +
                    '</div>'
                );
            } else {
                return (
                    '<div class="document-item has-doc">' +
                    '<span class="doc-label">' + docName + ':</span> ' +
                    '<a href="' + fullPath + '" target="_blank" class="doc-link">Ver documento (PDF)</a>' +
                    '</div>'
                );
            }
        }

        // Create modal with documents
        const modalHTML =
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content documents-modal" onclick="event.stopPropagation()">' +
            '<h2>Documentos da Análise de Crédito</h2>' +
            '<div class="client-info-section">' +
            '<p><strong>Nome:</strong> ' + (analysis.name || 'Não informado') + '</p>' +
            '<p><strong>Email:</strong> ' + (analysis.email || 'Não informado') + '</p>' +
            '<p><strong>Telefone:</strong> ' + (analysis.phone || 'Não informado') + '</p>' +
            '</div>' +
            '<hr style="margin: 15px 0; border: none; border-top: 1px solid #e5e7eb;">' +
            '<h3 style="margin-bottom: 15px; color: #374151;">Documentos Enviados</h3>' +
            '<div class="documents-grid">' +
            getDocumentPreview(analysis.doc_identidade, 'CPF e RG ou CNH') +
            getDocumentPreview(analysis.doc_endereco, 'Comprovante de Endereço') +
            getDocumentPreview(analysis.doc_renda, 'Comprovante de Renda') +
            getDocumentPreview(analysis.doc_bancario, 'Dados Bancários') +
            '</div>' +
            '<div class="modal-actions">' +
            '<button onclick="closeModal()" class="btn btn-primary">Fechar</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
        console.error('[v0] Erro ao carregar documentos:', error);
        alert('Erro ao carregar documentos. Tente novamente.');
    }
}

// Open document image in modal
function openDocumentImage(imageSrc) {
    const imageModal = document.createElement('div');
    imageModal.className = 'image-modal-overlay';
    imageModal.innerHTML =
        '<div class="image-modal-content">' +
        '<button class="image-modal-close" onclick="this.closest(\'.image-modal-overlay\').remove()">' +
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' +
        '</svg>' +
        '</button>' +
        '<img src="' + imageSrc + '" alt="Documento">' +
        '</div>';

    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.remove();
        }
    });

    document.body.appendChild(imageModal);
}

// Delete credit analysis
async function deleteCreditAnalysis(analysisId) {
    if (!confirm('ATENÇÃO: Deseja realmente deletar esta análise de crédito? Esta ação não pode ser desfeita!')) {
        return;
    }

    try {
        const response = await fetch('../api/credit-analysis.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: analysisId,
            }),
        });

        const result = await response.json();

        if (result.success) {
            alert('Análise de crédito deletada com sucesso!');
            location.reload();
        } else {
            alert('Erro ao deletar análise: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao deletar análise:', error);
        alert('Erro ao deletar análise. Tente novamente.');
    }
}

// Load employees on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
});
