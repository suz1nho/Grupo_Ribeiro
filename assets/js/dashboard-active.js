// ==============================
// ACTIVE APPOINTMENTS TAB
// ==============================

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
        actions += `<button data-action="markcontract" data-id="${a.id}" class="admin-btn bg-gray-600 hover:bg-gray-700">${icon('confirmed')} Marcar Contrato</button>`;
    } else if (a.status !== 'confirmed' && a.status !== 'approved') {
        actions += `<button data-action="confirm" data-id="${a.id}" class="admin-btn bg-green-600 hover:bg-green-700">${icon('confirmed')} Confirmar Presença</button>`;
    }
    actions += `<button data-action="notes" data-id="${a.id}" class="admin-btn bg-purple-600 hover:bg-purple-700">${icon('document')} Mensagem</button>`;
    actions += `<button data-action="whatsapp" data-phone="${escapeHtml(a.phone)}" data-name="${escapeHtml(a.name)}" class="admin-btn bg-green-600 hover:bg-green-700">${icon('whatsapp')} WhatsApp</button>`;
    actions += `<button data-action="email" data-email="${escapeHtml(a.email)}" data-name="${escapeHtml(a.name)}" class="admin-btn bg-blue-600 hover:bg-blue-700">${icon('clients')} Email</button>`;
    actions += `<button data-action="print" data-id="${a.id}" data-type="appointment" class="admin-btn bg-gray-600 hover:bg-gray-700">${icon('printer')} Imprimir</button>`;
    if (emp.role === 'Administrativo' || emp.role === 'admin') {
        actions += `<button data-action="delete" data-id="${a.id}" class="admin-btn bg-red-500 hover:bg-red-600">Deletar</button>`;
    }
    
    // User message first, then employee message (notes) below
    const msgHtml = a.message
        ? `<div class="flex items-center gap-3 mt-3">${icon('document')}<div><p class="font-semibold text-blue-800">Mensagem do Cliente</p><p class="text-sm text-blue-700 mt-1 leading-relaxed">${a.message}</p></div></div>`
        : '';
    const notesHtml = a.notes
        ? `<div class="employee-message-box"><p class="msg-label">Mensagem do Funcionário</p><p class="msg-content">${escapeHtml(a.notes)}</p></div>`
        : '';
    
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
            ${notesHtml}
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t">${actions}</div>
        </div>
    `;
}
