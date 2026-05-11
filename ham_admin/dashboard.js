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

    var tabs = [tabActive, tabClosed, tabCredit, tabClients];
    for (var t = 0; t < tabs.length; t++) {
        tabs[t].classList.remove('active');
    }

    var contents = [contentActive, contentClosed, contentCredit, contentClients];
    for (var c = 0; c < contents.length; c++) {
        contents[c].style.display = 'none';
    }

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
    var savedTab = localStorage.getItem('activeTab') || 'active';
    switchTab(savedTab);
});

function toggleDocuments(analysisId) {
    var container = document.getElementById('documents-' + analysisId);
    var arrow = document.getElementById('doc-arrow-' + analysisId);

    if (container.style.display === 'none') {
        container.style.display = 'block';
        arrow.style.transform = 'rotate(90deg)';
    } else {
        container.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

function closeModal() {
    var modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

var allEmployees = [];

async function loadEmployees() {
    try {
        var response = await fetch('api/employees.php');
        var data = await response.json();
        if (data.success && data.data) {
            allEmployees = data.data;
        } else {
            allEmployees = [];
        }
    } catch (error) {
        console.error('Erro ao carregar funcionarios:', error);
        allEmployees = [];
    }
}

async function confirmAppointment(id) {
    showEmployeeSelection(id);
}

async function unconfirmAppointment(appointmentId) {
    if (!confirm('Tem certeza que deseja desconfirmar este agendamento?')) {
        return;
    }

    try {
        var response = await fetch('api/appointments.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: appointmentId, status: 'pending', confirmed_by: null }),
        });

        var result = await response.json();
        if (result.success) {
            alert('Agendamento desconfirmado com sucesso!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao desconfirmar:', error);
        alert('Erro ao desconfirmar agendamento.');
    }
}

async function deleteAppointment(id) {
    if (!confirm('Tem certeza que deseja deletar este agendamento?')) {
        return;
    }

    try {
        var response = await fetch('api/appointments.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id }),
        });

        var result = await response.json();
        if (result.success) {
            alert('Agendamento deletado com sucesso!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar agendamento.');
    }
}

async function showEmployeeSelection(appointmentId) {
    if (allEmployees.length === 0) {
        await loadEmployees();
    }

    if (allEmployees.length === 0) {
        alert('Nenhum funcionario encontrado.');
        return;
    }

    var empButtons = '';
    for (var i = 0; i < allEmployees.length; i++) {
        var emp = allEmployees[i];
        empButtons += '<button class="employee-selection-button" onclick="confirmAppointmentWithEmployee(' + appointmentId + ',' + emp.id + ')">' +
            '<div class="employee-info">' +
            '<div class="employee-name">' + escHtml(emp.name) + '</div>' +
            '<div class="employee-details">' + escHtml(emp.role || 'Funcionario') + '</div>' +
            '</div>' +
            '</button>';
    }

    document.body.insertAdjacentHTML('beforeend',
        '<div class="modal-overlay" onclick="closeModal()">' +
        '<div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">' +
        '<h2>Selecionar Funcionario</h2>' +
        '<p class="modal-subtitle">Quem ira atender este agendamento?</p>' +
        '<div class="employee-selection-grid">' + empButtons + '</div>' +
        '<div class="modal-actions"><button onclick="closeModal()" class="btn btn-secondary">Cancelar</button></div>' +
        '</div></div>'
    );
}

async function confirmAppointmentWithEmployee(appointmentId, employeeId) {
    try {
        var apptRes = await fetch('api/appointments.php?id=' + appointmentId);
        var apptData = await apptRes.json();
        if (!apptData.success) { alert('Erro ao buscar agendamento'); return; }

        var resp = await fetch('api/appointments.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: appointmentId, status: 'approved', confirmed_by: employeeId }),
        });

        var result = await resp.json();
        if (result.success) {
            closeModal();
            sendWhatsAppMessage(apptData.data);
            alert('Agendamento confirmado!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao confirmar:', error);
        alert('Erro ao confirmar agendamento.');
    }
}

function sendWhatsAppMessage(appointment) {
    var apptDate = new Date(appointment.appointment_date + 'T00:00:00');
    var formattedDate = apptDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    var message = 'Ola ' + appointment.name + '! Seu agendamento foi confirmado para ' + formattedDate + ' as ' + appointment.appointment_time + '. Aguardamos voce!';
    var cleanPhone = appointment.phone.replace(/\D/g, '');
    var phoneCode = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    window.open('https://wa.me/' + phoneCode + '?text=' + encodeURIComponent(message), '_blank');
}

async function markContract(appointmentId) {
    if (!confirm('Confirmar que o contrato foi fechado?')) return;

    try {
        var resp = await fetch('api/appointments.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: appointmentId, status: 'closed', contract_closed_by: window.employeeId }),
        });

        var result = await resp.json();
        if (result.success) {
            alert('Contrato fechado!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao fechar contrato:', error);
        alert('Erro ao fechar contrato.');
    }
}

function printAppointment(appointmentId) {
    fetch('api/appointments.php?id=' + appointmentId)
        .then(function(r) { return r.json(); })
        .then(function(response) {
            if (response.success) {
                var apt = response.data;
                var w = window.open('', '_blank');
                w.document.write(
                    '<!DOCTYPE html><html><head><title>Agendamento</title>' +
                    '<style>body{font-family:Arial;padding:40px}h1{color:#333}</style></head><body>' +
                    '<h1>Detalhes do Agendamento</h1>' +
                    '<p><b>Nome:</b> ' + apt.name + '</p>' +
                    '<p><b>Email:</b> ' + apt.email + '</p>' +
                    '<p><b>Telefone:</b> ' + apt.phone + '</p>' +
                    '<p><b>Data:</b> ' + formatDate(apt.appointment_date) + '</p>' +
                    '<p><b>Horario:</b> ' + apt.appointment_time + '</p>' +
                    '</body></html>'
                );
                w.document.close();
                setTimeout(function() { w.print(); }, 250);
            }
        })
        .catch(function(error) {
            alert('Erro ao imprimir');
            console.error(error);
        });
}

async function showNotesModal(appointmentId) {
    try {
        var resp = await fetch('api/appointments.php?id=' + appointmentId);
        var data = await resp.json();
        var currentNotes = (data.success && data.data) ? (data.data.notes || '') : '';

        document.body.insertAdjacentHTML('beforeend',
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content notes-modal" onclick="event.stopPropagation()">' +
            '<h2>Informacoes do Agendamento</h2>' +
            '<p class="modal-subtitle">Adicione anotacoes:</p>' +
            '<textarea id="appointmentNotes" class="notes-textarea" rows="10">' + currentNotes + '</textarea>' +
            '<div class="modal-actions">' +
            '<button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>' +
            '<button onclick="saveNotes(' + appointmentId + ')" class="btn btn-primary">Salvar</button>' +
            '</div></div></div>'
        );

        setTimeout(function() {
            var el = document.getElementById('appointmentNotes');
            if (el) el.focus();
        }, 100);
    } catch (error) {
        console.error('Erro ao carregar notas:', error);
        alert('Erro ao carregar notas.');
    }
}

async function saveNotes(appointmentId) {
    var notes = document.getElementById('appointmentNotes').value;

    try {
        var resp = await fetch('api/appointments.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: appointmentId, notes: notes }),
        });

        var result = await resp.json();
        if (result.success) {
            closeModal();
            alert('Anotacoes salvas!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao salvar notas:', error);
        alert('Erro ao salvar notas.');
    }
}

async function confirmCreditAnalysis(analysisId) {
    try {
        var resp = await fetch('api/credit-analysis.php?action=employees');
        var data = await resp.json();
        if (!data.success || !data.data) { alert('Erro ao carregar funcionarios'); return; }

        var employees = data.data;
        var empButtons = '';
        for (var i = 0; i < employees.length; i++) {
            var emp = employees[i];
            empButtons += '<button class="employee-selection-button" onclick="executeCreditConfirmation(' + analysisId + ',' + emp.id + ')">' +
                '<div class="employee-info">' +
                '<div class="employee-name">' + escHtml(emp.name) + '</div>' +
                '<div class="employee-details">' + escHtml(emp.role || 'Funcionario') + '</div>' +
                '</div></button>';
        }

        document.body.insertAdjacentHTML('beforeend',
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">' +
            '<h2>Selecionar Responsavel</h2>' +
            '<p class="modal-subtitle">Escolha o funcionario:</p>' +
            '<div class="employee-selection-grid">' + empButtons + '</div>' +
            '<div class="modal-actions"><button onclick="closeModal()" class="btn btn-secondary">Cancelar</button></div>' +
            '</div></div>'
        );
    } catch (error) {
        console.error('Erro ao carregar funcionarios:', error);
        alert('Erro ao carregar funcionarios.');
    }
}

async function executeCreditConfirmation(analysisId, employeeId) {
    closeModal();

    try {
        var analysisResp = await fetch('api/credit-analysis.php?id=' + analysisId);
        var analysisData = await analysisResp.json();
        if (!analysisData.success) { alert('Erro ao buscar analise'); return; }

        var resp = await fetch('api/credit-analysis.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: analysisId, status: 'approved', analyzed_by: employeeId }),
        });

        var result = await resp.json();
        if (result.success) {
            sendCreditAnalysisWhatsAppMessage(analysisData.data);
            alert('Analise confirmada!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao confirmar analise:', error);
        alert('Erro ao confirmar analise.');
    }
}

function sendCreditAnalysisWhatsAppMessage(analysis) {
    var amount = analysis.requested_amount ? Number.parseFloat(analysis.requested_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    var cleanPhone = analysis.phone.replace(/\D/g, '');
    var phoneCode = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    var message = 'Ola ' + analysis.name + '! Sua analise de credito foi confirmada! Valor: ' + amount + '. Aguardamos voce!';
    window.open('https://wa.me/' + phoneCode + '?text=' + encodeURIComponent(message), '_blank');
}

async function updateCreditStatus(analysisId, status) {
    var labels = { pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado' };
    if (!confirm('Alterar status para ' + labels[status] + '?')) return;

    try {
        var resp = await fetch('api/credit-analysis.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: analysisId, status: status }),
        });

        var result = await resp.json();
        if (result.success) {
            alert('Status atualizado!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status.');
    }
}

async function unconfirmCreditAnalysis(analysisId) {
    if (!confirm('Desmarcar esta analise?')) return;

    try {
        var resp = await fetch('api/credit-analysis.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: analysisId, status: 'pending', analyzed_by: null }),
        });

        var result = await resp.json();
        if (result.success) {
            alert('Analise desmarcada!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao desmarcar:', error);
        alert('Erro ao desmarcar analise.');
    }
}

async function viewCreditDocuments(analysisId) {
    try {
        var resp = await fetch('api/credit-analysis.php?id=' + analysisId);
        var data = await resp.json();
        if (!data.success) { alert('Erro ao carregar documentos'); return; }

        var analysis = data.data;

        function docPreview(path, label) {
            if (!path) {
                return '<div class="document-item no-doc"><span class="doc-label">' + label + ':</span> <span class="doc-status">Nao enviado</span></div>';
            }
            var fullPath = '../uploads/credit-analysis/' + path;
            var ext = path.split('.').pop().toLowerCase();
            var isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].indexOf(ext) !== -1;
            if (isImg) {
                return '<div class="document-item has-doc"><span class="doc-label">' + label + ':</span><div class="doc-image-container"><img src="' + fullPath + '" alt="' + label + '" class="doc-thumbnail" onclick="openDocumentImage('' + fullPath + '')"><a href="' + fullPath + '" target="_blank" class="doc-link-btn">Abrir</a></div></div>';
            } else {
                return '<div class="document-item has-doc"><span class="doc-label">' + label + ':</span> <a href="' + fullPath + '" target="_blank" class="doc-link">Ver documento (PDF)</a></div>';
            }
        }

        document.body.insertAdjacentHTML('beforeend',
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content documents-modal" onclick="event.stopPropagation()">' +
            '<h2>Documentos</h2>' +
            '<p><strong>Nome:</strong> ' + (analysis.name || 'Nao informado') + '</p>' +
            '<p><strong>Email:</strong> ' + (analysis.email || 'Nao informado') + '</p>' +
            '<hr>' +
            docPreview(analysis.doc_identidade, 'CPF e RG') +
            docPreview(analysis.doc_endereco, 'Endereco') +
            docPreview(analysis.doc_renda, 'Renda') +
            docPreview(analysis.doc_bancario, 'Bancario') +
            '<div class="modal-actions"><button onclick="closeModal()" class="btn btn-primary">Fechar</button></div>' +
            '</div></div>'
        );
    } catch (error) {
        console.error('Erro ao carregar documentos:', error);
        alert('Erro ao carregar documentos.');
    }
}

function openDocumentImage(imageSrc) {
    var imgModal = document.createElement('div');
    imgModal.className = 'image-modal-overlay';
    imgModal.innerHTML =
        '<div class="image-modal-content">' +
        '<button class="image-modal-close" onclick="this.parentElement.parentElement.remove()" aria-label="Fechar">\u2716</button>' +
        '<img src="' + imageSrc + '" alt="Documento">' +
        '</div>';
    imgModal.addEventListener('click', function(e) {
        if (e.target === imgModal) imgModal.remove();
    });
    document.body.appendChild(imgModal);
}

async function deleteCreditAnalysis(analysisId) {
    if (!confirm('ATENCAO: Deletar esta analise?')) return;

    try {
        var resp = await fetch('api/credit-analysis.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: analysisId }),
        });

        var result = await resp.json();
        if (result.success) {
            alert('Analise deletada!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar analise.');
    }
}

// ==================== CLIENT MANAGEMENT ====================

function showAddClientModal() {
    document.body.insertAdjacentHTML('beforeend',
        '<div class="modal-overlay" onclick="closeModal()">' +
        '<div class="modal-content add-client-modal" onclick="event.stopPropagation()">' +
        '<h2>Adicionar Cliente</h2>' +
        '<div class="form-grid client-form-grid">' +
        '<div class="form-group"><label>Nome *</label><input type="text" id="clientName" class="form-input" required></div>' +
        '<div class="form-group"><label>Email</label><input type="email" id="clientEmail" class="form-input"></div>' +
        '<div class="form-group"><label>Telefone</label><input type="tel" id="clientPhone" class="form-input"></div>' +
        '<div class="form-group"><label>CPF</label><input type="text" id="clientCpf" class="form-input"></div>' +
        '<div class="form-group full-width"><label>Descricao *</label><textarea id="clientDescription" class="form-input form-textarea" rows="4"></textarea></div>' +
        '</div>' +
        '<div class="modal-actions">' +
        '<button onclick="closeModal()" class="btn btn-cancel">Cancelar</button>' +
        '<button onclick="submitNewClient()" class="btn btn-primary">Salvar</button>' +
        '</div></div></div>'
    );
    setTimeout(function() {
        var el = document.getElementById('clientName');
        if (el) el.focus();
    }, 100);
}

async function submitNewClient() {
    var name = document.getElementById('clientName').value.trim();
    var desc = document.getElementById('clientDescription').value.trim();
    if (!name) { alert('Nome obrigatorio.'); document.getElementById('clientName').focus(); return; }
    if (!desc) { alert('Descricao obrigatoria.'); document.getElementById('clientDescription').focus(); return; }

    var fd = new FormData();
    fd.append('name', name);
    fd.append('email', document.getElementById('clientEmail').value.trim());
    fd.append('phone', document.getElementById('clientPhone').value.trim());
    fd.append('cpf', document.getElementById('clientCpf').value.trim());
    fd.append('description', desc);

    try {
        var resp = await fetch('api/clients.php', { method: 'POST', body: fd });
        var result = await resp.json();
        if (result.success) {
            alert('Cliente cadastrado!');
            closeModal();
            location.reload();
        } else {
            alert('Erro: ' + (result.message || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao cadastrar cliente.');
    }
}

// ==================== CLIENT ACTIONS: EDIT, DELETE, WHATSAPP ====================

function sendClientWhatsApp(phone, name) {
    if (!phone) { alert('Sem telefone.'); return; }
    var cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) { alert('Telefone invalido.'); return; }
    var msg = 'Ola ' + name.replace(/[
]+/g, ' ').trim() + '! Somos do Grupo Ribeiro. Como podemos ajudar?';
    var code = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    window.open('https://wa.me/' + code + '?text=' + encodeURIComponent(msg), '_blank');
}

async function editClient(clientId) {
    try {
        var resp = await fetch('api/clients.php?id=' + clientId);
        var data = await resp.json();
        if (!data.success) { alert('Erro ao carregar cliente.'); return; }

        var c = data.data;
        var activeSel = c.status === 'active' ? ' selected' : '';
        var suspSel = c.status === 'suspended' ? ' selected' : '';

        document.body.insertAdjacentHTML('beforeend',
            '<div class="modal-overlay" onclick="closeModal()">' +
            '<div class="modal-content add-client-modal" onclick="event.stopPropagation()">' +
            '<h2>Editar Cliente</h2>' +
            '<div class="form-grid client-form-grid">' +
            '<div class="form-group"><label>Nome *</label><input type="text" id="editClientName" class="form-input" value="' + escHtml(c.name || '') + '"></div>' +
            '<div class="form-group"><label>Email</label><input type="email" id="editClientEmail" class="form-input" value="' + escHtml(c.email || '') + '"></div>' +
            '<div class="form-group"><label>Telefone</label><input type="tel" id="editClientPhone" class="form-input" value="' + escHtml(c.phone || '') + '"></div>' +
            '<div class="form-group"><label>CPF</label><input type="text" id="editClientCpf" class="form-input" value="' + escHtml(c.cpf || '') + '"></div>' +
            '<div class="form-group"><label>Status</label><select id="editClientStatus" class="form-input"><option value="active"' + activeSel + '>Ativo</option><option value="suspended"' + suspSel + '>Suspenso</option></select></div>' +
            '<div class="form-group full-width"><label>Descricao</label><textarea id="editClientDescription" class="form-input form-textarea" rows="4">' + escHtml(c.description || '') + '</textarea></div>' +
            '</div>' +
            '<div class="modal-actions">' +
            '<button onclick="closeModal()" class="btn btn-cancel">Cancelar</button>' +
            '<button onclick="submitEditClient(' + clientId + ')" class="btn btn-primary">Salvar</button>' +
            '</div></div></div>'
        );
    } catch (error) {
        console.error('Erro ao editar:', error);
        alert('Erro ao carregar dados.');
    }
}

async function submitEditClient(clientId) {
    var name = document.getElementById('editClientName').value.trim();
    if (!name) { alert('Nome obrigatorio.'); document.getElementById('editClientName').focus(); return; }

    try {
        var resp = await fetch('api/clients.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: clientId,
                name: name,
                email: document.getElementById('editClientEmail').value.trim(),
                phone: document.getElementById('editClientPhone').value.trim(),
                cpf: document.getElementById('editClientCpf').value.trim(),
                status: document.getElementById('editClientStatus').value,
                description: document.getElementById('editClientDescription').value.trim(),
            }),
        });

        var result = await resp.json();
        if (result.success) {
            alert('Cliente atualizado!');
            closeModal();
            location.reload();
        } else {
            alert('Erro: ' + (result.message || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        alert('Erro ao atualizar cliente.');
    }
}

async function deleteClient(clientId) {
    if (!confirm('ATENCAO: Deletar este cliente?')) return;

    try {
        var resp = await fetch('api/clients.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: clientId }),
        });

        var result = await resp.json();
        if (result.success) {
            alert('Cliente deletado!');
            location.reload();
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar cliente.');
    }
}

// Helper: Escape HTML
function escHtml(text) {
    if (!text) return '';
    text = text.replace(/[
]+/g, ' ');
    text = text.replace(/&/g, '&amp;');
    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/"/g, '&quot;');
    text = text.replace(/'/g, '&#039;');
    return text;
}

document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
});
