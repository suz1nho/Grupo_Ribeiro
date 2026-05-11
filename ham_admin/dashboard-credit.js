// ==============================
// CREDIT ANALYSIS TAB
// ==============================

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
                    <button data-action="whatsapp" data-phone="${escapeHtml(ca.phone)}" data-name="${escapeHtml(ca.name ?? 'Cliente')}" class="admin-btn bg-green-600 hover:bg-green-700">${icon('whatsapp')} WhatsApp</button>
                    <button data-action="email" data-email="${escapeHtml(ca.email ?? '')}" data-name="${escapeHtml(ca.name ?? 'Cliente')}" class="admin-btn bg-blue-600 hover:bg-blue-700">${icon('clients')} Email</button>
                    ${analyzerActions}
                    <button data-action="print" data-id="${ca.id}" data-type="credit" class="admin-btn bg-gray-600 hover:bg-gray-700">${icon('printer')} Imprimir</button>
                    ${adminDelete}
                </div>
            </div>
        `;
    }).join('');
}
