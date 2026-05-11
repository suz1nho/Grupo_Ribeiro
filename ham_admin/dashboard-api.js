// ==============================
// Dashboard API Helpers
// ==============================

const API_BASE = 'api';

// ─── Generic fetch helper ───
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options,
        });
        return await response.json();
    } catch (error) {
        console.error('[API] Error:', error);
        return { success: false, message: 'Erro de comunicação' };
    }
}

// ─── Specific API calls ───
async function loadDashboardData() {
    const resp = await fetch(`${API_BASE}/dashboard.php`);
    return await resp.json();
}

async function updateAppointment(id, data) {
    return apiFetch('appointments.php', {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
    });
}

async function deleteAppointment(id) {
    return apiFetch('appointments.php', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
    });
}

async function updateCreditAnalysis(id, data) {
    return apiFetch('credit-analysis.php', {
        method: 'PUT',
        body: JSON.stringify({ id, ...data }),
    });
}

async function deleteCreditAnalysis(id) {
    return apiFetch('credit-analysis.php', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
    });
}

async function deleteClient(clientId) {
    return apiFetch('clients.php', {
        method: 'DELETE',
        body: JSON.stringify({ client_id: clientId }),
    });
}

async function getEmployees() {
    const resp = await fetch(`${API_BASE}/employees-list.php`);
    return await resp.json();
}
