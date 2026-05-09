// ==============================
// Dashboard Tab Renderers & Modals
// ==============================

// ─── Icons loaded from SVG files ───
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

// ─── Active Appointments ───
function renderActiveAppointments(appointments) {
    const container = document.getElementById('content-active');
    if (!appointments.length) {
        container.innerHTML = '<div class="text-center py-12 text-gray-500">Nenhum agendamento no momento</div>';
        return;
    }
    container.innerHTML = appointments.map(a => buildAppointmentCard(a)).join('');
}

function buildAppointmentCard(a) {
    const emp = window.__EMPLOYEE__;
    let actions = '';
    if ((a.status === 'confirmed' || a.status === 'approved') && a.confirmed_by == emp.id) {
        actions += `<button data-action="unconfirm" data-id="${a.id}" class="admin-btn bg-red-600 hover:bg-red-700">${icon('x')} Desconfirmar</button>`;
        actions += `<button data-action="notes" data-id="${a.id}" class="admin-btn bg-purple-600 hover:bg-purple-700">${icon('document')} Informações</button>`;
        actions += `<button data-action="markcontract" data-id="${a.id}" class="admin-btn bg-gray-600 hover:bg-gray-700">${icon('confirmed')} Marcar Contrato</button>`;
    } else if (a.status !== 'confirmed' && a.status !== 'approved') {
        actions += `<button data-action="confirm" data-id="${a.id}" class="admin-btn bg-green-600 hover:bg-green-700">${icon('confirmed')} Confirmar Presença</button>`;
        actions += `<button data-action="notes" data-id="${a.id}" class="admin-btn bg-purple-600 hover:bg-purple-700">${icon('document')} Informações</button>`;
    }
    actions += `<button data-action="print" data-id="${a.id}" data-type="appointment" class="admin-btn bg-blue-600 hover:bg-blue-700">${icon('printer')} Imprimir</button>`;
    if (emp.role === 'Administrativo' || emp.role === 'admin') {
        actions += `<button data-action="delete" data-id="${a.id}" class="admin-btn bg-red-500 hover:bg-red-600">Deletar</button>`;
    }
    const msgHtml = a.message ? `<div class="flex items-center gap-3 mt-4">${icon('document')}<div><p class="font-semibold text-blue-800">Mensagem do Cliente</p><p class="text-sm text-blue-700 mt-2 leading-relaxed">${a.message}</p></div></div>` : '';
    return `
        <div class="appointment-card" data-id="${a.id}">
            <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-3">
                    <div class="flex items-center gap-3">${icon('total_appointments')}<div><p class="text-xs text-gray-600">Data</p><p class="font-semibold">${a.appointment_date_formatted}</p></div></div>
                    <div class="flex items-center gap-3">${icon('clock')}<div><p class="text-xs text-gray-600">Horário</p><p class="font-semibold">${a.appointment_time}</p></div></div>
                    <div class="flex items-center gap-3">${icon('clock')}<div><p class="text-xs text-gray-600">Atendente</p><p class="font-semibold">${escapeHtml(a.confirmed_by_name)}</p></div></div>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Nome</p><p class="font-semibold">${escapeHtml(a.name)}</p></div></div>
                    <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Email</p><p class="font-semibold">${escapeHtml(a.email)}</p></div></div>
                    <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Telefone</p><p class="font-semibold">${escapeHtml(a.phone)}</p></div></div>
                </div>
            </div>
            ${msgHtml}
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t">${actions}</div>
        </div>
    `;
}

// ─── Closed Contracts ───
function renderClosedContracts(contracts) {
    const container = document.getElementById('content-closed');
    if (!contracts.length) {
        container.innerHTML = '<div class="text-center py-12 text-gray-500">Nenhum contrato fechado no momento</div>';
        return;
    }
    const emp = window.__EMPLOYEE__;
    container.innerHTML = contracts.map(c => `
        <div class="appointment-card bg-green-50 border-green-200">
            <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-3">
                    <div class="flex items-center gap-3">${icon('total_appointments')}<div><p class="text-xs text-gray-600">Data do contrato</p><p class="font-semibold">${c.contract_closed_at_formatted}</p></div></div>
                    <div class="flex items-center gap-3">${icon('clock')}<div><p class="text-xs text-gray-600">Horário</p><p class="font-semibold">${c.appointment_time}</p></div></div>
                    <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Atendente</p><p class="font-semibold">${escapeHtml(c.contract_closed_by_name)}</p></div></div>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Nome</p><p class="font-semibold">${escapeHtml(c.name)}</p></div></div>
                    <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Email</p><p class="font-semibold">${escapeHtml(c.email)}</p></div></div>
                    <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Telefone</p><p class="font-semibold">${escapeHtml(c.phone)}</p></div></div>
                </div>
            </div>
            ${c.message ? `<div class="flex items-center gap-3 mt-4">${icon('document')}<div><p class="font-semibold text-blue-800">Mensagem</p><p class="text-sm text-blue-700">${c.message}</p></div></div>` : ''}
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button data-action="print" data-id="${c.id}" data-type="contract" class="admin-btn bg-blue-600 hover:bg-blue-700">${icon('printer')} Imprimir</button>
                ${(emp.role === 'Administrativo' || emp.role === 'admin') ? `<button data-action="delete" data-id="${c.id}" class="admin-btn bg-red-500 hover:bg-red-600">Deletar</button>` : ''}
            </div>
        </div>
    `).join('');
}

// ─── Credit Analyses ───
function renderCreditAnalyses(analyses) {
    const container = document.getElementById('content-credit');
    if (!analyses.length) {
        container.innerHTML = '<div class="text-center py-12 text-gray-500">Nenhuma análise de crédito no momento</div>';
        return;
    }
    const emp = window.__EMPLOYEE__;
    container.innerHTML = analyses.map(ca => {
        const statusColor = ca.status === 'approved' ? 'text-green-600' : ca.status === 'rejected' ? 'text-red-600' : 'text-yellow-600';
        const analyzerActions = ca.analyzed_by ? `
            <button data-action="viewDocs" data-id="${ca.id}" class="admin-btn bg-blue-600 hover:bg-blue-700">${icon('eye')} Ver Documentos</button>
            <button data-action="creditStatus" data-id="${ca.id}" data-status="pending" class="admin-btn bg-yellow-600 hover:bg-yellow-700">${icon('clock')} Pendente</button>
            <button data-action="creditStatus" data-id="${ca.id}" data-status="approved" class="admin-btn bg-green-600 hover:bg-green-700">${icon('confirmed')} Aprovado</button>
            <button data-action="creditStatus" data-id="${ca.id}" data-status="rejected" class="admin-btn bg-red-600 hover:bg-red-700">${icon('x')} Rejeitado</button>
            <button data-action="unassignCredit" data-id="${ca.id}" class="admin-btn bg-gray-600 hover:bg-gray-700">${icon('x')} Desmarcar Análise</button>
        ` : `
            <button data-action="viewDocs" data-id="${ca.id}" class="admin-btn bg-blue-600 hover:bg-blue-700">${icon('eye')} Ver Documentos</button>
            <button data-action="assignCredit" data-id="${ca.id}" class="admin-btn bg-green-600 hover:bg-green-700">${icon('confirmed')} Confirmar Análise de Crédito</button>
        `;
        const adminDelete = (emp.role === 'Administrativo' || emp.role === 'admin') 
            ? `<button data-action="deleteCredit" data-id="${ca.id}" class="admin-btn bg-red-800 hover:bg-red-900">${icon('x')} Deletar</button>` 
            : '';
        return `
            <div class="appointment-card bg-cyan-50 border-cyan-200">
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">${icon('total_appointments')}<div><p class="text-xs text-gray-600">Data de Envio</p><p class="font-semibold">${ca.data_formatada}</p></div></div>
                        <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Telefone</p><p class="font-semibold">${escapeHtml(ca.phone)}</p></div></div>
                        <div class="flex items-center gap-3">${icon('confirmed')}<div><p class="text-xs text-gray-600">Status</p><p class="font-semibold ${statusColor}">${ca.status_text}</p></div></div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Nome</p><p class="font-semibold">${escapeHtml(ca.name ?? 'Nome não disponível')}</p></div></div>
                        <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Email</p><p class="font-semibold">${escapeHtml(ca.email ?? 'E-mail não disponível')}</p></div></div>
                        <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Atendente</p><p class="font-semibold">${escapeHtml(ca.confirmed_by_name)}</p></div></div>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                    ${analyzerActions}
                    <button data-action="print" data-id="${ca.id}" data-type="credit" class="admin-btn bg-gray-600 hover:bg-gray-700">${icon('printer')} Imprimir</button>
                    ${adminDelete}
                </div>
            </div>
        `;
    }).join('');
}

// ─── Clients ───
function renderClients(clients) {
    const container = document.getElementById('content-clients');
    const total = clients.length;
    let listHtml = '';
    if (!total) {
        listHtml = '<div class="text-center py-12 text-gray-500">Nenhum cliente cadastrado no momento</div>';
    } else {
        listHtml = clients.map(c => {
            const safePhone = escapeHtml(c.phone || '');
            const safeName = escapeHtml(c.name);
            const descHtml = c.description ? `<div class="flex items-center gap-3 mt-4">${icon('document')}<div><p class="font-semibold text-blue-800">Descrição</p><p class="text-sm text-blue-700">${escapeHtml(c.description)}</p></div></div>` : '';
            const registeredByHtml = c.registered_by_name ? `<div class="mt-4 pt-4 border-t border-blue-200"><p class="text-xs text-blue-600">Registrado por: <span class="font-semibold">${escapeHtml(c.registered_by_name)}</span></p></div>` : '';
            return `
                <div class="appointment-card bg-blue-50 border-blue-200">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="space-y-3">
                            <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Nome</p><p class="font-semibold">${safeName}</p></div></div>
                            <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">CPF</p><p class="font-semibold">${escapeHtml(c.cpf || 'Não informado')}</p></div></div>
                            <div class="flex items-center gap-3">${icon('confirmed')}<div><p class="text-xs text-gray-600">Status</p><p class="font-semibold">${c.status_text}</p></div></div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Email</p><p class="font-semibold">${escapeHtml(c.email || 'Não informado')}</p></div></div>
                            <div class="flex items-center gap-3">${icon('clients')}<div><p class="text-xs text-gray-600">Telefone</p><p class="font-semibold">${safePhone}</p></div></div>
                            <div class="flex items-center gap-3">${icon('total_appointments')}<div><p class="text-xs text-gray-600">Registrado em</p><p class="font-semibold">${c.registered_at_formatted}</p></div></div>
                        </div>
                    </div>
                    ${descHtml}
                    ${registeredByHtml}
                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button data-action="print" data-id="${c.client_id}" data-type="client" class="admin-btn bg-gray-600 hover:bg-gray-700">${icon('printer')} Imprimir</button>
                        <button data-action="whatsapp" data-phone="${safePhone}" data-name="${safeName}" class="admin-btn bg-green-500 hover:bg-green-600">${icon('whatsapp')} WhatsApp</button>
                        <button data-action="editClient" data-id="${c.client_id}" class="admin-btn bg-blue-600 hover:bg-blue-700">${icon('edit')} Editar</button>
                        <button data-action="deleteClient" data-id="${c.client_id}" class="admin-btn bg-red-500 hover:bg-red-600">Deletar</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    container.innerHTML = `
        <div class="clients-tab-header">
            <span class="clients-count">Total: ${total} clientes cadastrados</span>
            <button id="addClientBtn" class="add-client-btn">${icon('clients')} Adicionar Cliente</button>
        </div>
        <div class="space-y-4">${listHtml}</div>
    `;
    document.getElementById('addClientBtn').onclick = () => showAddClientModal();
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
        
        // Build document links
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
        
        // Create modal
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

// ─── Info / Notes Modal (for appointments) ───
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
        overlay.id = 'notesModalOverlay';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h2>Informações do Agendamento #${id}</h2>
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;padding:0.25rem;color:#6b7280;">&times;</button>
                </div>
                <div style="display:grid;gap:1rem;margin:1.5rem 0;">
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#f8fafc;border-radius:0.5rem;border:1px solid #e2e8f0;">
                        <strong style="min-width:130px;color:#475569;">Cliente:</strong>
                        <span>${escapeHtml(appointment.name)}</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#f8fafc;border-radius:0.5rem;border:1px solid #e2e8f0;">
                        <strong style="min-width:130px;color:#475569;">Email:</strong>
                        <span>${escapeHtml(appointment.email)}</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#f8fafc;border-radius:0.5rem;border:1px solid #e2e8f0;">
                        <strong style="min-width:130px;color:#475569;">Telefone:</strong>
                        <span>${escapeHtml(appointment.phone)}</span>
                    </div>
                    ${appointment.cpf ? `
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#f8fafc;border-radius:0.5rem;border:1px solid #e2e8f0;">
                        <strong style="min-width:130px;color:#475569;">CPF:</strong>
                        <span>${escapeHtml(appointment.cpf)}</span>
                    </div>` : ''}
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#f8fafc;border-radius:0.5rem;border:1px solid #e2e8f0;">
                        <strong style="min-width:130px;color:#475569;">Data:</strong>
                        <span>${appointment.appointment_date || ''}</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#f8fafc;border-radius:0.5rem;border:1px solid #e2e8f0;">
                        <strong style="min-width:130px;color:#475569;">Horário:</strong>
                        <span>${appointment.appointment_time || ''}</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#f8fafc;border-radius:0.5rem;border:1px solid #e2e8f0;">
                        <strong style="min-width:130px;color:#475569;">Status:</strong>
                        <span>${appointment.status === 'confirmed' ? 'Confirmado' : appointment.status === 'closed' ? 'Contrato Fechado' : 'Pendente'}</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#f8fafc;border-radius:0.5rem;border:1px solid #e2e8f0;">
                        <strong style="min-width:130px;color:#475569;">Atendente:</strong>
                        <span>${escapeHtml(appointment.confirmed_by_name || 'Não confirmado')}</span>
                    </div>
                    ${appointment.message ? `
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#fef3c7;border-radius:0.5rem;border:1px solid #fde68a;">
                        <strong style="min-width:130px;color:#92400e;">Mensagem:</strong>
                        <span style="color:#78350f;">${escapeHtml(appointment.message)}</span>
                    </div>` : ''}
                    ${appointment.notes ? `
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#e0f2fe;border-radius:0.5rem;border:1px solid #bae6fd;">
                        <strong style="min-width:130px;color:#075985;">Observações:</strong>
                        <span style="color:#0c4a6e;">${escapeHtml(appointment.notes)}</span>
                    </div>` : ''}
                    ${appointment.contract_closed_at ? `
                    <div style="display:flex;gap:0.5rem;padding:0.75rem;background:#d1fae5;border-radius:0.5rem;border:1px solid #a7f3d0;">
                        <strong style="min-width:130px;color:#065f46;">Contrato fechado em:</strong>
                        <span>${new Date(appointment.contract_closed_at).toLocaleString('pt-BR')}</span>
                    </div>` : ''}
                </div>
                <div class="modal-actions">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

    } catch (e) {
        console.error(e);
        alert('Erro ao carregar informações do agendamento.');
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

    // Open a new window with a clean print layout
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
                ${data.notes ? `<div class="print-row"><strong>Observações:</strong> ${escapeHtml(data.notes)}</div>` : ''}
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
                    min-width: 140px;
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

    // Form submit handler
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
    // Fetch current client data
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

    // Form submit handler
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
