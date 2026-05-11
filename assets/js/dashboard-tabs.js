// ==============================
// DASHBOARD SHARED MODULE - Icons, Helpers, Modals
// ==============================

window.__ICONS__ = {};

async function loadIcons() {
    const names = [
        'total_appointments', 'confirmed', 'document', 'clock', 'clients',
        'conversion_rate', 'edit', 'eye', 'printer', 'x', 'menu', 'whatsapp'
    ];
    await Promise.all(names.map(async (name) => {
        try {
            const resp = await fetch(`../assets/svg/${name}.svg`);
            if (resp.ok) {
                window.__ICONS__[name] = await resp.text();
            }
        } catch (e) {
            console.warn(`[Icon] Could not load ${name}.svg`);
        }
    }));
}

function icon(name) {
    return window.__ICONS__[name] || '';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Employee Selection Modal (for appointments) ───
let pendingConfirmId = null;

function openEmployeeModal(appointmentId) {
    pendingConfirmId = appointmentId;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'employeeModal';
    overlay.innerHTML = `
        <div class="modal-content employee-selection-modal">
            <h2>Selecionar Atendente</h2>
            <p class="modal-subtitle">Escolha o funcionário que irá receber este agendamento</p>
            <div id="employeeList" class="employee-selection-grid">
                <div class="text-center py-4 text-gray-500">Carregando funcionários...</div>
            </div>
            <div class="modal-actions">
                <button onclick="closeEmployeeModal()" class="btn btn-cancel">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    getEmployees().then(json => {
        const list = document.getElementById('employeeList');
        if (!json.success || !json.data.length) {
            list.innerHTML = '<div class="text-center py-4 text-gray-500">Nenhum funcionário ativo encontrado</div>';
            return;
        }
        list.innerHTML = json.data.map(emp => `
            <button class="employee-selection-button" onclick="confirmWithEmployee(${emp.id})">
                <div class="employee-info">
                    <div class="employee-name">${escapeHtml(emp.name)}</div>
                    <div class="employee-details">${escapeHtml(emp.role)}${emp.email ? ' - ' + escapeHtml(emp.email) : ''}</div>
                </div>
            </button>
        `).join('');
    }).catch(() => {
        document.getElementById('employeeList').innerHTML = '<div class="text-center py-4 text-red-500">Erro ao carregar funcionários</div>';
    });
}

function closeEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    if (modal) modal.remove();
    pendingConfirmId = null;
}

async function confirmWithEmployee(employeeId) {
    if (!pendingConfirmId) return;
    await updateAppointment(pendingConfirmId, { status: 'confirmed', confirmed_by: employeeId });
    closeEmployeeModal();
    loadDashboard();
}

// ─── Employee Selection Modal (for credit analysis) ───
let pendingCreditId = null;

function openCreditEmployeeModal(analysisId) {
    pendingCreditId = analysisId;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'creditEmployeeModal';
    overlay.innerHTML = `
        <div class="modal-content employee-selection-modal">
            <h2>Selecionar Analista</h2>
            <p class="modal-subtitle">Escolha o funcionário que irá analisar este crédito</p>
            <div id="creditEmployeeList" class="employee-selection-grid">
                <div class="text-center py-4 text-gray-500">Carregando funcionários...</div>
            </div>
            <div class="modal-actions">
                <button onclick="closeCreditEmployeeModal()" class="btn btn-cancel">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    getEmployees().then(json => {
        const list = document.getElementById('creditEmployeeList');
        if (!json.success || !json.data.length) {
            list.innerHTML = '<div class="text-center py-4 text-gray-500">Nenhum funcionário ativo encontrado</div>';
            return;
        }
        list.innerHTML = json.data.map(emp => `
            <button class="employee-selection-button" onclick="confirmCreditWithEmployee(${emp.id})">
                <div class="employee-info">
                    <div class="employee-name">${escapeHtml(emp.name)}</div>
                    <div class="employee-details">${escapeHtml(emp.role)}${emp.email ? ' - ' + escapeHtml(emp.email) : ''}</div>
                </div>
            </button>
        `).join('');
    }).catch(() => {
        document.getElementById('creditEmployeeList').innerHTML = '<div class="text-center py-4 text-red-500">Erro ao carregar funcionários</div>';
    });
}

function closeCreditEmployeeModal() {
    const modal = document.getElementById('creditEmployeeModal');
    if (modal) modal.remove();
    pendingCreditId = null;
}

async function confirmCreditWithEmployee(employeeId) {
    if (!pendingCreditId) return;
    await updateCreditAnalysis(pendingCreditId, { analyzed_by: employeeId });
    closeCreditEmployeeModal();
    loadDashboard();
}

// ─── Employee Message Editor Modal (uses `notes` field) ───
async function showNotesModal(id) {
    try {
        const resp = await fetch(`${API_BASE}/appointments.php?id=${id}`);
        const json = await resp.json();
        if (!json.success || !json.data) {
            alert('Erro ao carregar dados do agendamento.');
            return;
        }
        const appointment = json.data;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'employeeMessageModal';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:500px;">
                <div class="modal-header">
                    <h2>Mensagem do Funcionário</h2>
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;padding:0.25rem;color:#6b7280;">&times;</button>
                </div>
                <p style="color:#6b7280;margin-bottom:1rem;">Agendamento #${id} - ${escapeHtml(appointment.name)}</p>
                <div style="display:flex;flex-direction:column;gap:0.75rem;">
                    <label style="font-weight:600;color:#374151;">Mensagem interna (só visível para funcionários):</label>
                    <textarea id="employeeMessageInput" style="width:100%;min-height:120px;padding:0.75rem;border:1px solid #c4b5fd;border-radius:0.5rem;font-size:0.9rem;resize:vertical;" placeholder="Digite sua observação ou instrução...">${escapeHtml(appointment.notes || '')}</textarea>
                    <button onclick="saveEmployeeMessage(${id})" class="btn btn-primary" style="align-self:flex-end;padding:0.625rem 1.5rem;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;border:none;border-radius:0.5rem;cursor:pointer;font-weight:600;">Salvar Mensagem</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

    } catch (e) {
        console.error(e);
        alert('Erro ao carregar informações do agendamento.');
    }
}

async function saveEmployeeMessage(appointmentId) {
    const input = document.getElementById('employeeMessageInput');
    if (!input) return;
    const message = input.value.trim();
    const btn = input.nextElementSibling;
    btn.disabled = true;
    btn.textContent = 'Salvando...';
    try {
        // Use `notes` field instead of employee_message
        const result = await updateAppointment(appointmentId, { notes: message });
        if (result.success) {
            const overlay = document.getElementById('employeeMessageModal');
            if (overlay) overlay.remove();
            loadDashboard();
        } else {
            alert('Erro ao salvar mensagem: ' + (result.message || 'Erro desconhecido'));
        }
    } catch (e) {
        alert('Erro ao salvar mensagem.');
        console.error(e);
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Salvar Mensagem'; }
}

// ─── Document Viewer Modal ───
async function viewCreditDocuments(id) {
    try {
        const resp = await fetch(`${API_BASE}/credit-analysis.php?id=${id}`);
        const json = await resp.json();
        if (!json.success || !json.data) {
            alert('Erro ao carregar documentos.');
            return;
        }
        const ca = json.data;
        
        const uploadBase = '../uploads/credit-analysis/';
        const docs = [
            { label: 'Documento de Identidade', file: ca.doc_identidade },
            { label: 'Comprovante de Endereço', file: ca.doc_endereco },
            { label: 'Comprovante de Renda', file: ca.doc_renda },
            { label: 'Extrato Bancário', file: ca.doc_bancario }
        ];
        
        let docHtml = '';
        let hasDocs = false;
        docs.forEach(d => {
            if (d.file) {
                hasDocs = true;
                const ext = d.file.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                const fileUrl = uploadBase + d.file;
                if (isImage) {
                    docHtml += `
                        <div class="doc-item">
                            <p class="font-semibold text-gray-700 mb-2">${d.label}</p>
                            <img src="${fileUrl}" alt="${d.label}" class="doc-thumbnail" onclick="window.open('${fileUrl}', '_blank')" style="max-width:100%;max-height:200px;cursor:pointer;border-radius:8px;object-fit:cover;">
                            <div class="mt-2">
                                <a href="${fileUrl}" target="_blank" class="doc-link">${icon('eye')} Abrir em nova aba</a>
                                <a href="${fileUrl}" download class="doc-link ml-4">${icon('document')} Download</a>
                            </div>
                        </div>
                    `;
                } else {
                    docHtml += `
                        <div class="doc-item">
                            <p class="font-semibold text-gray-700 mb-2">${d.label}</p>
                            <div class="flex gap-3">
                                <a href="${fileUrl}" target="_blank" class="doc-link">${icon('eye')} Visualizar</a>
                                <a href="${fileUrl}" download class="doc-link">${icon('document')} Download</a>
                            </div>
                        </div>
                    `;
                }
            }
        });
        
        if (!hasDocs) {
            docHtml = '<p class="text-gray-500 text-center py-4">Nenhum documento enviado para esta análise.</p>';
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content documents-modal">
                <div class="modal-header">
                    <h2>Documentos da Análise #${id}</h2>
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;padding:0.25rem;color:#6b7280;">&times;</button>
                </div>
                <p class="modal-subtitle">${escapeHtml(ca.name)} - ${escapeHtml(ca.email)}</p>
                <div class="documents-grid">${docHtml}</div>
                <div class="modal-actions">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
    } catch (e) {
        console.error(e);
        alert('Erro ao carregar documentos.');
    }
}

// ─── Print record (appointment / contract / client / credit analysis) ───
async function printRecord(type, id) {
    let data = null;
    try {
        if (type === 'appointment' || type === 'contract') {
            const resp = await fetch(`${API_BASE}/appointments.php?id=${id}`);
            const json = await resp.json();
            if (!json.success) throw new Error('Record not found');
            data = json.data;
        } else if (type === 'client') {
            const resp = await fetch(`${API_BASE}/clients.php?id=${id}`);
            const json = await resp.json();
            if (!json.success) throw new Error('Record not found');
            data = json.data;
        } else if (type === 'credit') {
            const resp = await fetch(`${API_BASE}/credit-analysis.php?id=${id}`);
            const json = await resp.json();
            if (!json.success) throw new Error('Record not found');
            data = json.data;
        } else {
            alert('Tipo de impressão inválido.');
            return;
        }
    } catch (e) {
        console.error(e);
        alert('Erro ao carregar dados para impressão.');
        return;
    }

    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) {
        alert('Pop-up bloqueado. Permita pop-ups para este site.');
        return;
    }

    const companyName = 'Grupo Ribeiro';
    let contentHtml = '';
    let printTypeLabel = '';

    if (type === 'appointment') {
        printTypeLabel = 'AGENDAMENTO';
        contentHtml = `
            <div class="print-section">
                <div class="print-row"><strong>Data:</strong> ${data.appointment_date || ''} ${data.appointment_time || ''}</div>
                <div class="print-row"><strong>Cliente:</strong> ${escapeHtml(data.name)}</div>
                <div class="print-row"><strong>Email:</strong> ${escapeHtml(data.email)}</div>
                <div class="print-row"><strong>Telefone:</strong> ${escapeHtml(data.phone)}</div>
                ${data.cpf ? `<div class="print-row"><strong>CPF:</strong> ${escapeHtml(data.cpf)}</div>` : ''}
                ${data.message ? `<div class="print-row"><strong>Mensagem:</strong> ${escapeHtml(data.message)}</div>` : ''}
                ${data.notes ? `<div class="print-row"><strong>Mensagem do Funcionário:</strong> ${escapeHtml(data.notes)}</div>` : ''}
                ${data.confirmed_by_name ? `<div class="print-row"><strong>Atendente:</strong> ${escapeHtml(data.confirmed_by_name)}</div>` : ''}
                <div class="print-row"><strong>Status:</strong> ${data.status === 'confirmed' ? 'Confirmado' : data.status === 'closed' ? 'Contrato Fechado' : 'Pendente'}</div>
            </div>
        `;
    } else if (type === 'contract') {
        printTypeLabel = 'CONTRATO FECHADO';
        contentHtml = `
            <div class="print-section">
                <div class="print-row"><strong>Data do Contrato:</strong> ${data.contract_closed_at_formatted || data.contract_closed_at || ''}</div>
                <div class="print-row"><strong>Cliente:</strong> ${escapeHtml(data.name)}</div>
                <div class="print-row"><strong>Email:</strong> ${escapeHtml(data.email)}</div>
                <div class="print-row"><strong>Telefone:</strong> ${escapeHtml(data.phone)}</div>
                ${data.cpf ? `<div class="print-row"><strong>CPF:</strong> ${escapeHtml(data.cpf)}</div>` : ''}
                ${data.message ? `<div class="print-row"><strong>Mensagem:</strong> ${escapeHtml(data.message)}</div>` : ''}
                ${data.notes ? `<div class="print-row"><strong>Mensagem do Funcionário:</strong> ${escapeHtml(data.notes)}</div>` : ''}
                <div class="print-row"><strong>Atendente:</strong> ${escapeHtml(data.contract_closed_by_name || data.confirmed_by_name || 'Não identificado')}</div>
            </div>
        `;
    } else if (type === 'client') {
        printTypeLabel = 'FICHA DO CLIENTE';
        contentHtml = `
            <div class="print-section">
                <div class="print-row"><strong>Nome:</strong> ${escapeHtml(data.name)}</div>
                <div class="print-row"><strong>Email:</strong> ${escapeHtml(data.email || 'Não informado')}</div>
                <div class="print-row"><strong>Telefone:</strong> ${escapeHtml(data.phone || 'Não informado')}</div>
                <div class="print-row"><strong>CPF:</strong> ${escapeHtml(data.cpf || 'Não informado')}</div>
                <div class="print-row"><strong>Status:</strong> ${data.status === 'active' ? 'Ativo' : 'Suspenso'}</div>
                <div class="print-row"><strong>Registrado em:</strong> ${data.registered_at_formatted || data.registered_at || ''}</div>
                ${data.description ? `<div class="print-row"><strong>Descrição:</strong> ${escapeHtml(data.description)}</div>` : ''}
                ${data.registered_by_name ? `<div class="print-row"><strong>Registrado por:</strong> ${escapeHtml(data.registered_by_name)}</div>` : ''}
            </div>
        `;
    } else if (type === 'credit') {
        printTypeLabel = 'ANÁLISE DE CRÉDITO';
        const statusText = data.status === 'approved' ? 'Aprovado' : data.status === 'rejected' ? 'Rejeitado' : 'Pendente';
        contentHtml = `
            <div class="print-section">
                <div class="print-row"><strong>Data de Envio:</strong> ${data.data_formatada || data.created_at || ''}</div>
                <div class="print-row"><strong>Nome:</strong> ${escapeHtml(data.name || 'Não disponível')}</div>
                <div class="print-row"><strong>Email:</strong> ${escapeHtml(data.email || 'Não disponível')}</div>
                <div class="print-row"><strong>Telefone:</strong> ${escapeHtml(data.phone)}</div>
                <div class="print-row"><strong>CPF:</strong> ${escapeHtml(data.cpf || 'Não informado')}</div>
                <div class="print-row"><strong>Status:</strong> ${statusText}</div>
                ${data.score !== null && data.score !== undefined ? `<div class="print-row"><strong>Score:</strong> ${data.score}</div>` : ''}
                ${data.notes ? `<div class="print-row"><strong>Observações:</strong> ${escapeHtml(data.notes)}</div>` : ''}
                <div class="print-row"><strong>Analista:</strong> ${escapeHtml(data.confirmed_by_name || 'Não identificado')}</div>
                <div class="print-row"><strong>Documentos Enviados:</strong> ${[data.doc_identidade, data.doc_endereco, data.doc_renda, data.doc_bancario].filter(Boolean).length} arquivo(s)</div>
            </div>
        `;
    }

    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${companyName} - ${printTypeLabel}</title>
            <style>
                @page { margin: 20mm; }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    color: #1e293b;
                    line-height: 1.6;
                    padding: 0;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #10b981;
                }
                .print-header h1 { font-size: 26px; color: #065f46; margin-bottom: 5px; }
                .print-header p { color: #64748b; font-size: 14px; }
                .print-type {
                    display: inline-block;
                    background: #d1fae5;
                    color: #065f46;
                    padding: 4px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .print-section {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 20px;
                    background: #f8fafc;
                }
                .print-row {
                    padding: 8px 0;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    gap: 8px;
                }
                .print-row:last-child { border-bottom: none; }
                .print-row strong {
                    min-width: 170px;
                    color: #475569;
                    flex-shrink: 0;
                }
                .print-footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 12px;
                }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                }
                .no-print { text-align: center; margin-bottom: 20px; }
                .no-print button {
                    padding: 10px 30px;
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                }
                .no-print button:hover { background: #059669; }
            </style>
        </head>
        <body>
            <div class="no-print">
                <button onclick="window.print()">Imprimir / Salvar PDF</button>
            </div>
            <div class="print-header">
                <h1>${companyName}</h1>
                <p>Sistema de Gestão Empresarial</p>
            </div>
            <div style="text-align:center;">
                <span class="print-type">${printTypeLabel}</span>
            </div>
            ${contentHtml}
            <div class="print-footer">
                <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
            </div>
        </body>
        </html>
    `);
    win.document.close();
}

// ─── Client Modals (Add / Edit) ───
function closeClientModal() {
    const overlay = document.getElementById('clientModalOverlay');
    if (overlay) overlay.remove();
}

function showAddClientModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'clientModalOverlay';
    overlay.innerHTML = `
        <div class="modal-content add-client-modal">
            <div class="modal-header">
                <h2>Adicionar Cliente</h2>
                <button onclick="closeClientModal()" class="btn-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;padding:0.25rem;color:#6b7280;">&times;</button>
            </div>
            <p class="modal-subtitle">Preencha os dados do novo cliente</p>
            <form id="addClientForm" onsubmit="return false;">
                <div class="client-form-grid">
                    <div class="form-group full-width">
                        <label for="clientName">Nome Completo <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="clientName" name="name" class="form-input" required placeholder="Nome do cliente">
                    </div>
                    <div class="form-group">
                        <label for="clientEmail">Email</label>
                        <input type="email" id="clientEmail" name="email" class="form-input" placeholder="cliente@email.com">
                    </div>
                    <div class="form-group">
                        <label for="clientPhone">Telefone</label>
                        <input type="text" id="clientPhone" name="phone" class="form-input" placeholder="(XX) XXXXX-XXXX">
                    </div>
                    <div class="form-group">
                        <label for="clientCpf">CPF</label>
                        <input type="text" id="clientCpf" name="cpf" class="form-input" placeholder="XXX.XXX.XXX-XX">
                    </div>
                    <div class="form-group">
                        <label for="clientStatus">Status</label>
                        <select id="clientStatus" name="status" class="form-input">
                            <option value="active">Ativo</option>
                            <option value="suspended">Suspenso</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label for="clientDescription">Descrição</label>
                        <textarea id="clientDescription" name="description" class="form-input form-textarea" placeholder="Observações sobre o cliente"></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="closeClientModal()" class="btn btn-cancel">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="submitClientBtn">Salvar Cliente</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('addClientForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitClientBtn');
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        const data = {
            name: document.getElementById('clientName').value.trim(),
            email: document.getElementById('clientEmail').value.trim(),
            phone: document.getElementById('clientPhone').value.trim(),
            cpf: document.getElementById('clientCpf').value.replace(/\D/g, ''),
            description: document.getElementById('clientDescription').value.trim(),
            status: document.getElementById('clientStatus').value
        };

        if (!data.name) {
            alert('O nome do cliente é obrigatório.');
            btn.disabled = false;
            btn.textContent = 'Salvar Cliente';
            return;
        }

        const result = await apiFetch('clients.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (result.success) {
            closeClientModal();
            loadDashboard();
        } else {
            alert('Erro ao adicionar cliente: ' + (result.message || 'Erro desconhecido'));
        }
        btn.disabled = false;
        btn.textContent = 'Salvar Cliente';
    });
}

async function editClient(clientId) {
    const resp = await fetch(`${API_BASE}/clients.php?id=${clientId}`);
    const json = await resp.json();
    if (!json.success || !json.data) {
        alert('Erro ao carregar dados do cliente.');
        return;
    }
    const client = json.data;
    showEditClientModal(client);
}

function showEditClientModal(client) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'clientModalOverlay';
    overlay.innerHTML = `
        <div class="modal-content add-client-modal">
            <div class="modal-header">
                <h2>Editar Cliente</h2>
                <button onclick="closeClientModal()" class="btn-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;padding:0.25rem;color:#6b7280;">&times;</button>
            </div>
            <p class="modal-subtitle">Atualize os dados do cliente</p>
            <form id="editClientForm" onsubmit="return false;">
                <div class="client-form-grid">
                    <div class="form-group full-width">
                        <label for="editClientName">Nome Completo <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="editClientName" name="name" class="form-input" required value="${escapeHtml(client.name || '')}">
                    </div>
                    <div class="form-group">
                        <label for="editClientEmail">Email</label>
                        <input type="email" id="editClientEmail" name="email" class="form-input" value="${escapeHtml(client.email || '')}">
                    </div>
                    <div class="form-group">
                        <label for="editClientPhone">Telefone</label>
                        <input type="text" id="editClientPhone" name="phone" class="form-input" value="${escapeHtml(client.phone || '')}">
                    </div>
                    <div class="form-group">
                        <label for="editClientCpf">CPF</label>
                        <input type="text" id="editClientCpf" name="cpf" class="form-input" value="${escapeHtml(client.cpf || '')}">
                    </div>
                    <div class="form-group">
                        <label for="editClientStatus">Status</label>
                        <select id="editClientStatus" name="status" class="form-input">
                            <option value="active" ${client.status === 'active' ? 'selected' : ''}>Ativo</option>
                            <option value="suspended" ${client.status === 'suspended' ? 'selected' : ''}>Suspenso</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label for="editClientDescription">Descrição</label>
                        <textarea id="editClientDescription" name="description" class="form-input form-textarea">${escapeHtml(client.description || '')}</textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="closeClientModal()" class="btn btn-cancel">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="submitEditClientBtn">Atualizar Cliente</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('editClientForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submitEditClientBtn');
        btn.disabled = true;
        btn.textContent = 'Atualizando...';

        const data = {
            client_id: client.client_id,
            name: document.getElementById('editClientName').value.trim(),
            email: document.getElementById('editClientEmail').value.trim(),
            phone: document.getElementById('editClientPhone').value.trim(),
            cpf: document.getElementById('editClientCpf').value.replace(/\D/g, ''),
            description: document.getElementById('editClientDescription').value.trim(),
            status: document.getElementById('editClientStatus').value
        };

        if (!data.name) {
            alert('O nome do cliente é obrigatório.');
            btn.disabled = false;
            btn.textContent = 'Atualizar Cliente';
            return;
        }

        const result = await apiFetch('clients.php', {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        if (result.success) {
            closeClientModal();
            loadDashboard();
        } else {
            alert('Erro ao atualizar cliente: ' + (result.message || 'Erro desconhecido'));
        }
        btn.disabled = false;
        btn.textContent = 'Atualizar Cliente';
    });
}
