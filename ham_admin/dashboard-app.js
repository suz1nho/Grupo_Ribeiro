// ==============================
// Dashboard Main App
// ==============================

// ─── Stats Rendering ───
function renderStats(stats) {
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card blue">
            <div class="stat-card-header">
                <div class="stat-card-content">
                    <h3>Total de Agendamentos</h3>
                    <div class="stat-card-value">${stats.total_appointments}</div>
                    <div class="stat-card-label">Agendamentos deste mês</div>
                </div>
                <div class="stat-card-icon">${icon('total_appointments')}</div>
            </div>
        </div>
        <div class="stat-card orange">
            <div class="stat-card-header">
                <div class="stat-card-content">
                    <h3>Agendamentos Confirmados</h3>
                    <div class="stat-card-value">${stats.confirmed_appointments}</div>
                    <div class="stat-card-label">Presenças confirmadas este mês</div>
                </div>
                <div class="stat-card-icon">${icon('confirmed')}</div>
            </div>
        </div>
        <div class="stat-card green">
            <div class="stat-card-header">
                <div class="stat-card-content">
                    <h3>Contratos Fechados</h3>
                    <div class="stat-card-value">${stats.contracts_closed}</div>
                    <div class="stat-card-label">Contratos fechados este mês</div>
                </div>
                <div class="stat-card-icon">${icon('document')}</div>
            </div>
        </div>
        <div class="stat-card cyan">
            <div class="stat-card-header">
                <div class="stat-card-content">
                    <h3>Análise de Crédito</h3>
                    <div class="stat-card-value">${stats.pending_credit_analysis}</div>
                    <div class="stat-card-label">Pendentes de análise este mês</div>
                </div>
                <div class="stat-card-icon">${icon('document')}</div>
            </div>
        </div>
        <div class="stat-card purple">
            <div class="stat-card-header">
                <div class="stat-card-content">
                    <h3>Taxa de Conversão</h3>
                    <div class="stat-card-value">${stats.confirmation_rate}%</div>
                    <div class="stat-card-label">Conversão mensal</div>
                </div>
                <div class="stat-card-icon">${icon('conversion_rate')}</div>
            </div>
        </div>
        <div class="stat-card indigo">
            <div class="stat-card-header">
                <div class="stat-card-content">
                    <h3>Meus Clientes</h3>
                    <div class="stat-card-value">${stats.my_clients}</div>
                    <div class="stat-card-label">Clientes cadastrados este mês</div>
                </div>
                <div class="stat-card-icon">${icon('clients')}</div>
            </div>
        </div>
    `;
}

function renderMobileStats(stats) {
    document.getElementById('mobileStatsList').innerHTML = `
        <div class="mobile-stat-card blue">
            <div class="mobile-stat-icon">${icon('total_appointments')}</div>
            <div class="mobile-stat-content">
                <h3>Total de Agendamentos</h3>
                <div class="mobile-stat-value">${stats.total_appointments}</div>
                <div class="mobile-stat-label">Agendamentos deste mês</div>
            </div>
        </div>
        <div class="mobile-stat-card orange">
            <div class="mobile-stat-icon">${icon('confirmed')}</div>
            <div class="mobile-stat-content">
                <h3>Agendamentos Confirmados</h3>
                <div class="mobile-stat-value">${stats.confirmed_appointments}</div>
                <div class="mobile-stat-label">Presenças confirmadas este mês</div>
            </div>
        </div>
        <div class="mobile-stat-card green">
            <div class="mobile-stat-icon">${icon('document')}</div>
            <div class="mobile-stat-content">
                <h3>Contratos Fechados</h3>
                <div class="mobile-stat-value">${stats.contracts_closed}</div>
                <div class="mobile-stat-label">Contratos fechados este mês</div>
            </div>
        </div>
        <div class="mobile-stat-card cyan">
            <div class="mobile-stat-icon">${icon('document')}</div>
            <div class="mobile-stat-content">
                <h3>Análise de Crédito</h3>
                <div class="mobile-stat-value">${stats.pending_credit_analysis}</div>
                <div class="mobile-stat-label">Pendentes de análise este mês</div>
            </div>
        </div>
        <div class="mobile-stat-card purple">
            <div class="mobile-stat-icon">${icon('conversion_rate')}</div>
            <div class="mobile-stat-content">
                <h3>Taxa Confirmação</h3>
                <div class="mobile-stat-value">${stats.confirmation_rate}%</div>
                <div class="mobile-stat-label">Conversão mensal</div>
            </div>
        </div>
        <div class="mobile-stat-card indigo">
            <div class="mobile-stat-icon">${icon('clients')}</div>
            <div class="mobile-stat-content">
                <h3>Meus Clientes</h3>
                <div class="mobile-stat-value">${stats.my_clients}</div>
                <div class="mobile-stat-label">Clientes cadastrados este mês</div>
            </div>
        </div>
    `;
}

// ─── Main Load Function ───
let iconsLoaded = false;

async function loadDashboard() {
    if (!iconsLoaded) {
        await loadIcons();
        iconsLoaded = true;
    }

    try {
        const json = await loadDashboardData();
        if (!json.success) {
            alert('Erro ao carregar dados.');
            return;
        }
        const data = json.data;
        document.getElementById('userName').textContent = window.__EMPLOYEE__.name;
        document.getElementById('userRole').textContent = window.__EMPLOYEE__.role;

        renderStats(data.stats);
        renderMobileStats(data.stats);
        renderActiveAppointments(data.active_appointments);
        renderClosedContracts(data.closed_contracts);
        renderCreditAnalyses(data.credit_analyses);
        renderClients(data.clients);
    } catch (e) {
        console.error(e);
        document.getElementById('content-active').innerHTML = '<div class="text-center py-12 text-gray-500">Erro ao carregar dados. Tente novamente.</div>';
    }
}

// ─── Tab Switching ───
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(`content-${tab}`).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
}

// ─── Mobile Menu ───
function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('active');
}

// ─── Event Delegation for Actions ───
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const type = btn.dataset.type;

    switch (action) {
        case 'confirm':
            openEmployeeModal(id);
            break;
        case 'unconfirm':
            await updateAppointment(id, { status: 'pending', confirmed_by: null });
            loadDashboard();
            break;
        case 'markcontract':
            await updateAppointment(id, { status: 'closed', contract_closed_by: window.__EMPLOYEE__.id });
            loadDashboard();
            break;
        case 'delete':
            if (!confirm('Deletar este agendamento?')) break;
            await deleteAppointment(id);
            loadDashboard();
            break;
        case 'print':
            if (type) {
                printRecord(type, id);
            } else {
                window.print();
            }
            break;
        case 'notes':
            showNotesModal(id);
            break;
        case 'assignCredit':
            openCreditEmployeeModal(id);
            break;
        case 'creditStatus':
            await updateCreditAnalysis(id, { status: btn.dataset.status });
            loadDashboard();
            break;
        case 'unassignCredit':
            await updateCreditAnalysis(id, { analyzed_by: null });
            loadDashboard();
            break;
        case 'viewDocs':
            viewCreditDocuments(id);
            break;
        case 'deleteCredit':
            if (!confirm('Deletar esta análise de crédito?')) break;
            await deleteCreditAnalysis(id);
            loadDashboard();
            break;
        case 'whatsapp': {
            const phone = btn.dataset.phone;
            const name = btn.dataset.name;
            const msg = encodeURIComponent(`Ola ${name}, tudo bem?`);
            window.open(`https://wa.me/55${phone.replace(/\D/g,'')}?text=${msg}`, '_blank');
            break;
        }
        case 'email': {
            const email = btn.dataset.email;
            const name = btn.dataset.name;
            window.open(`mailto:${email}?subject=Contato%20Grupo%20Ribeiro&body=Ola%20${encodeURIComponent(name)}%2C`, '_blank');
            break;
        }
        case 'editClient':
            editClient(id);
            break;
        case 'deleteClient':
            if (!confirm('Deletar este cliente?')) break;
            await deleteClient(id);
            loadDashboard();
            break;
    }
});

// ─── Init ───
document.addEventListener('DOMContentLoaded', loadDashboard);
setInterval(loadDashboard, 30000);
