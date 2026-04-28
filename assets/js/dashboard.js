// Dashboard JavaScript

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
}

function switchTab(tab) {
    const tabActive = document.getElementById('tab-active');
    const tabClosed = document.getElementById('tab-closed');
    const tabCredit = document.getElementById('tab-credit');
    const tabClients = document.getElementById('tab-clients');
    const contentActive = document.getElementById('content-active');
    const contentClosed = document.getElementById('content-closed');
    const contentCredit = document.getElementById('content-credit');
    const contentClients = document.getElementById('content-clients');
    
    localStorage.setItem('activeTab', tab);
    
    [tabActive, tabClosed, tabCredit, tabClients].forEach(t => {
        t.classList.remove('active');
    });
    
    [contentActive, contentClosed, contentCredit, contentClients].forEach(c => {
        c.style.display = 'none';
    });
    
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

document.addEventListener('DOMContentLoaded', function() {
    const savedTab = localStorage.getItem('activeTab') || 'active';
    switchTab(savedTab);
});

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

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
}

const API_BASE_URL = "../api";
let allEmployees = [];

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

async function confirmAppointment(id) {
    showEmployeeSelection(id);
}

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

async function showEmployeeSelection(appointmentId) {
    if (allEmployees.length === 0) {
        await loadEmployees();
    }

    if (allEmployees.length === 0) {
        alert('Nenhum funcionário encontrado no sistema.');
        return;
    }

    const employeeButtons = allEmployees.map(employee => {
        const safeName = employee.name.replace(/'/g, "\'");
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

function sendWhatsAppMessage(appointment, employeeName) {
    const appointmentDate = new Date(appointment.appointment_date + 'T00:00:00');
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const formattedTime = appointment.appointment_time;

    const message = `Ol\u00e1, ${appointment.name}! O seu agendamento foi confirmado para o dia ${formattedDate} no hor\u00e1rio ${formattedTime}. Aguardamos voc\u00ea!`;

    const cleanPhone = appointment.phone.replace(/\D/g, '');

    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const whatsappURL = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank');
}

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
            alert('Contrato marcado como fechado! O hor\u00e1rio ficar\u00e1 dispon\u00edvel novamente.');
            location.reload();
        } else {
            alert('Erro ao marcar contrato: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao marcar contrato:', error);
        alert('Erro ao marcar contrato. Tente novamente.');
    }
}

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
                    '<div class="info-row"><span class="label">Hor\u00e1rio:</span><span class="value">' + apt.appointment_time + '</span></div>' +
                    (apt.confirmed_by_name
                        ? '<div class="confirmed"><strong>Presen\u00e7a Confirmada</strong><br>Atendente: ' + apt.confirmed_by_name + '</div>'
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
            '<h2>Informa\u00e7\u00f5es do Agendamento</h2>' +
            '<p class="modal-subtitle">Adicione anota\u00e7\u00f5es importantes sobre este agendamento:</p>' +
            '<div class="notes-container">' +
            '<textarea id="appointmentNotes" class="notes-textarea" placeholder="Digite suas anota\u00e7\u00f5es aqui..." rows="10">' + currentNotes + '</textarea>' +
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
            alert('Anota\u00e7\u00f5es salvas com sucesso!');
            location.reload();
        } else {
            alert('Erro ao salvar anota\u00e7\u00f5es: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao salvar notas:', error);
        alert('Erro ao salvar anota\u00e7\u00f5es. Tente novamente.');
    }
}

async function confirmCreditAnalysis(analysisId) {
    try {
        const response = await fetch('../api/credit-analysis.php?action=employees');
        const data = await response.json();

        if (!data.success || !data.data) {
            alert('Erro ao carregar funcion\u00e1rios');
            return;
        }

        const employees = data.data;

        const modalHTML =
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">' +
            '<h2>Selecionar Funcion\u00e1rio Respons\u00e1vel</h2>' +
            '<p class="modal-subtitle">Escolha o funcion\u00e1rio que ser\u00e1 respons\u00e1vel por esta an\u00e1lise de cr\u00e9dito:</p>' +
            '<div class="employee-selection-grid">' +
            employees.map(emp =>
                '<button class="employee-selection-button" onclick="executeCreditConfirmation(' + analysisId + ', ' + emp.id + ')">' +
                '<div class="employee-info">' +
                '<div class="employee-name">' + emp.name + '</div>' +
                '<div class="employee-details">' + (emp.role || 'Funcion\u00e1rio') + '</div>' +
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
        console.error('[v0] Erro ao carregar funcion\u00e1rios:', error);
        alert('Erro ao carregar funcion\u00e1rios. Tente novamente.');
    }
}

async function executeCreditConfirmation(analysisId, employeeId) {
    closeModal();

    try {
        const analysisResponse = await fetch('../api/credit-analysis.php?id=' + analysisId);
        const analysisData = await analysisResponse.json();

        if (!analysisData.success || !analysisData.data) {
            alert('Erro ao buscar dados da an\u00e1lise de cr\u00e9dito');
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
            alert('An\u00e1lise de cr\u00e9dito confirmada com sucesso!');
            location.reload();
        } else {
            alert('Erro ao confirmar an\u00e1lise: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao confirmar an\u00e1lise:', error);
        alert('Erro ao confirmar an\u00e1lise. Tente novamente.');
    }
}

function sendCreditAnalysisWhatsAppMessage(analysis) {
    const formattedAmount = Number.parseFloat(analysis.requested_amount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    const message = `Ol\u00e1, ${analysis.name}! A sua an\u00e1lise de cr\u00e9dito foi confirmada! \u2705

Valor solicitado: ${formattedAmount}

Entre em contato conosco para darmos continuidade ao seu processo. Aguardamos voc\u00ea!`;

    const cleanPhone = analysis.phone.replace(/\D/g, '');

    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const whatsappURL = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank');
}

async function updateCreditStatus(analysisId, status) {
    const statusLabels = {
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
    };

    if (!confirm('Confirmar altera\u00e7\u00e3o do status para: ' + statusLabels[status] + '?')) {
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

async function unconfirmCreditAnalysis(analysisId) {
    if (!confirm('Deseja desmarcar esta an\u00e1lise de cr\u00e9dito? O funcion\u00e1rio respons\u00e1vel ser\u00e1 removido.')) {
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
            alert('An\u00e1lise desmarcada com sucesso!');
            location.reload();
        } else {
            alert('Erro ao desmarcar an\u00e1lise: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao desmarcar an\u00e1lise:', error);
        alert('Erro ao desmarcar an\u00e1lise. Tente novamente.');
    }
}

async function viewCreditDocuments(analysisId) {
    try {
        const response = await fetch('../api/credit-analysis.php?id=' + analysisId);
        const data = await response.json();

        if (!data.success || !data.data) {
            alert('Erro ao carregar documentos');
            return;
        }

        const analysis = data.data;

        function getDocumentPreview(docPath, docName) {
            if (!docPath) {
                return (
                    '<div class="document-item no-doc">' +
                    '<span class="doc-label">' + docName + ':</span> ' +
                    '<span class="doc-status">N\u00e3o enviado</span>' +
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

        const modalHTML =
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content documents-modal" onclick="event.stopPropagation()">' +
            '<h2>Documentos da An\u00e1lise de Cr\u00e9dito</h2>' +
            '<div class="client-info-section">' +
            '<p><strong>Nome:</strong> ' + (analysis.name || 'N\u00e3o informado') + '</p>' +
            '<p><strong>Email:</strong> ' + (analysis.email || 'N\u00e3o informado') + '</p>' +
            '<p><strong>Telefone:</strong> ' + (analysis.phone || 'N\u00e3o informado') + '</p>' +
            '</div>' +
            '<hr style="margin: 15px 0; border: none; border-top: 1px solid #e5e7eb;">' +
            '<h3 style="margin-bottom: 15px; color: #374151;">Documentos Enviados</h3>' +
            '<div class="documents-grid">' +
            getDocumentPreview(analysis.doc_identidade, 'CPF e RG ou CNH') +
            getDocumentPreview(analysis.doc_endereco, 'Comprovante de Endere\u00e7o') +
            getDocumentPreview(analysis.doc_renda, 'Comprovante de Renda') +
            getDocumentPreview(analysis.doc_bancario, 'Dados Banc\u00e1rios') +
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

function openDocumentImage(imageSrc) {
    const imageModal = document.createElement('div');
    imageModal.className = 'image-modal-overlay';
    // Use a simple text "X" button instead of an SVG image
    imageModal.innerHTML =
        '<div class="image-modal-content">' +
        '<button class="image-modal-close" onclick="this.closest(\'.image-modal-overlay\').remove()" aria-label="Fechar">' +
        '\u2716' +
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

async function deleteCreditAnalysis(analysisId) {
    if (!confirm('ATEN\u00c7\u00c3O: Deseja realmente deletar esta an\u00e1lise de cr\u00e9dito? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita!')) {
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
            alert('An\u00e1lise de cr\u00e9dito deletada com sucesso!');
            location.reload();
        } else {
            alert('Erro ao deletar an\u00e1lise: ' + result.message);
        }
    } catch (error) {
        console.error('[v0] Erro ao deletar an\u00e1lise:', error);
        alert('Erro ao deletar an\u00e1lise. Tente novamente.');
    }
}

// ==================== CLIENT MANAGEMENT ====================

function showAddClientModal() {
    const modalHTML =
        '<div class="modal-overlay" onclick="closeModal()">' +
        '<div class="modal-content add-client-modal" onclick="event.stopPropagation()">' +
        '<h2>Adicionar Novo Cliente</h2>' +
        '<p class="modal-subtitle">Preencha os dados do cliente para cadastr\u00e1-lo no sistema:</p>' +
        '<div class="form-grid client-form-grid">' +
        '' + 
        '<div class="form-group">' +
        '<label for="clientName">Nome Completo <span style="color: #ef4444;">*</span></label>' +
        '<input type="text" id="clientName" class="form-input" required placeholder="Digite o nome completo">' +
        '</div>' +
        '' + 
        '<div class="form-group">' +
        '<label for="clientEmail">Email</label>' +
        '<input type="email" id="clientEmail" class="form-input" placeholder="email@exemplo.com">' +
        '</div>' +
        '' + 
        '<div class="form-group">' +
        '<label for="clientPhone">Telefone</label>' +
        '<input type="tel" id="clientPhone" class="form-input" placeholder="(XX) XXXXX-XXXX">' +
        '</div>' +
        '' + 
        '<div class="form-group">' +
        '<label for="clientCpf">CPF</label>' +
        '<input type="text" id="clientCpf" class="form-input" placeholder="XXX.XXX.XXX-XX">' +
        '</div>' +
        '' + 
        '<div class="form-group full-width">' +
        '<label for="clientDescription">Descri\u00e7\u00e3o <span style="color: #ef4444;">*</span></label>' +
        '<textarea id="clientDescription" class="form-input form-textarea" required placeholder="Informa\u00e7\u00f5es adicionais sobre o cliente..." rows="4"></textarea>' +
        '</div>' +
        '</div>' +
        '<div class="modal-actions">' +
        '<button onclick="closeModal()" class="btn btn-cancel">Cancelar</button>' +
        '<button onclick="submitNewClient()" class="btn btn-primary">Salvar Cliente</button>' +
        '</div>' +
        '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    setTimeout(() => {
        const nameInput = document.getElementById('clientName');
        if (nameInput) nameInput.focus();
    }, 100);
}

async function submitNewClient() {
    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const cpf = document.getElementById('clientCpf').value.trim();
    const description = document.getElementById('clientDescription').value.trim();

    if (!name) {
        alert('O campo Nome \u00e9 obrigat\u00f3rio.');
        document.getElementById('clientName').focus();
        return;
    }

    if (!description) {
        alert('O campo Descri\u00e7\u00e3o \u00e9 obrigat\u00f3rio.');
        document.getElementById('clientDescription').focus();
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('cpf', cpf);
    formData.append('description', description);

    try {
        const response = await fetch('../api/clients.php', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            alert('Cliente cadastrado com sucesso!');
            closeModal();
            location.reload();
        } else {
            alert('Erro ao cadastrar cliente: ' + (result.message || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('[v0] Erro ao cadastrar cliente:', error);
        alert('Erro ao cadastrar cliente. Tente novamente.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
});
