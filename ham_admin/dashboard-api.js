// ==============================
// Dashboard API Helpers
// ==============================

const API_BASE = 'api';

// --- Helper to get the Bearer token from the global employee object ---
function getToken() {
    return (window.__EMPLOYEE__ && window.__EMPLOYEE__.api_token) || '';
}

// --- Generic fetch helper with token authentication ---
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        ...(options.headers || {})
    };
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            headers: headers,
            ...options,
        });
        if (response.status === 401) {
            alert('Sessao expirada. Faca login novamente.');
            window.location.href = 'index.php';
            return { success: false, message: 'Sessao expirada' };
        }
        return await response.json();
    } catch (error) {
        console.error('[API] Error:', error);
        return { success: false, message: 'Erro de comunicacao' };
    }
}

// --- Specific API calls ---
async function loadDashboardData() {
    const token = getToken();
    const resp = await fetch(`${API_BASE}/dashboard.php`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
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
    const token = getToken();
    const resp = await fetch(`${API_BASE}/employees.php`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    return await resp.json();
}
