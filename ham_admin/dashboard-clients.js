// ==============================
// CLIENTS TAB
// ==============================

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
                        <button data-action="whatsapp" data-phone="${safePhone}" data-name="${safeName}" class="admin-btn bg-green-600 hover:bg-green-600">${icon('whatsapp')} WhatsApp</button>
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
