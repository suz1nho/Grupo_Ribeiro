// ==============================
// CLOSED CONTRACTS TAB
// ==============================

function renderClosedContracts(contracts) {
    const container = document.getElementById('content-closed');
    if (!contracts.length) {
        container.innerHTML = '<div class="text-center py-12 text-gray-500">Nenhum contrato fechado no momento</div>';
        return;
    }
    const emp = window.__EMPLOYEE__;
    container.innerHTML = contracts.map(c => {
        const msgHtml = c.message
            ? `<div class="flex items-center gap-3 mt-3">${icon('document')}<div><p class="font-semibold text-blue-800">Mensagem do Cliente</p><p class="text-sm text-blue-700 mt-1 leading-relaxed">${c.message}</p></div></div>`
            : '';
        const notesHtml = c.notes
            ? `<div class="employee-message-box"><p class="msg-label">Mensagem do Funcionário</p><p class="msg-content">${escapeHtml(c.notes)}</p></div>`
            : '';
        return `
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
            ${msgHtml}
            ${notesHtml}
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button data-action="whatsapp" data-phone="${escapeHtml(c.phone)}" data-name="${escapeHtml(c.name)}" class="admin-btn bg-green-600 hover:bg-green-700">${icon('whatsapp')} WhatsApp</button>
                <button data-action="email" data-email="${escapeHtml(c.email)}" data-name="${escapeHtml(c.name)}" class="admin-btn bg-blue-600 hover:bg-blue-700">${icon('clients')} Email</button>
                <button data-action="print" data-id="${c.id}" data-type="contract" class="admin-btn bg-gray-600 hover:bg-gray-700">${icon('printer')} Imprimir</button>
                ${(emp.role === 'Administrativo' || emp.role === 'admin') ? `<button data-action="delete" data-id="${c.id}" class="admin-btn bg-red-500 hover:bg-red-600">Deletar</button>` : ''}
            </div>
        </div>
    `}).join('');
}
