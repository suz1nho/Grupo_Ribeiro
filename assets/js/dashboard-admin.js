
// Dashboard Admin JavaScript - Legacy functions kept for backward compatibility

const API_BASE_URL = "../api"

// Função para fazer requisições à API
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Erro na requisição:", error)
    return { success: false, message: "Erro na comunicação com o servidor" }
  }
}

// Carregar estatísticas do dashboard
async function loadDashboardStats() {
  const response = await fetchAPI("/stats.php")

  if (response.success) {
    const stats = response.data
    updateStatCard("total-appointments", stats.total_appointments)
    updateStatCard("pending-appointments", stats.pending_appointments)
    updateStatCard("confirmed-appointments", stats.confirmed_appointments)
    updateStatCard("new-contacts", stats.new_contacts)
    updateStatCard("pending-analysis", stats.pending_credit_analysis)
  }
}

// Atualizar card de estatística
function updateStatCard(id, value) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = value || 0
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("appointments-tbody")) {
    loadDashboardStats()
  }

  setInterval(loadDashboardStats, 30000)
})

const modalStyles =
  "<style>" +
  ".modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }" +
  ".modal-content { background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }" +
  ".modal-content h2 { margin-bottom: 1.5rem; color: #111827; }" +
  ".modal-subtitle { color: #6B7280; margin-bottom: 1.5rem; font-size: 0.95rem; }" +
  ".employee-selection-modal { max-width: 700px; }" +
  ".employee-selection-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; max-height: 500px; overflow-y: auto; padding: 0.5rem; }" +
  ".employee-selection-button { background: #F3F4F6; border: 2px solid #E5E7EB; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s; text-align: left; width: 100%; }" +
  ".employee-selection-button:hover { background: #EEF2FF; border-color: #6366F1; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }" +
  ".employee-info { display: flex; flex-direction: column; gap: 0.25rem; }" +
  ".employee-name { font-weight: 600; color: #111827; font-size: 1rem; }" +
  ".employee-details { font-size: 0.85rem; color: #6B7280; }" +
  ".modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }" +
  ".btn { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; transition: all 0.2s; }" +
  ".btn-primary { background: #6366F1; color: white; }" +
  ".btn-primary:hover { background: #4F46E5; }" +
  ".btn-secondary { background: #E5E7EB; color: #374151; }" +
  ".btn-secondary:hover { background: #D1D5DB; }" +
  ".notes-modal { max-width: 650px; }" +
  ".notes-container { margin: 1.5rem 0; }" +
  ".notes-textarea { width: 100%; padding: 1rem; border: 2px solid #E5E7EB; border-radius: 8px; font-family: inherit; font-size: 0.95rem; line-height: 1.6; resize: vertical; transition: border-color 0.2s; }" +
  ".notes-textarea:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }" +
  ".notes-textarea::placeholder { color: #9CA3AF; }" +
  ".documents-modal { max-width: 700px; }" +
  ".document-item { margin-bottom: 1rem; }" +
  ".document-link a { color: #6366F1; text-decoration: none; }" +
  ".document-link a:hover { text-decoration: underline; }" +
  ".image-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1001; }" +
  ".image-modal-content { background: white; border-radius: 12px; padding: 2rem; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; align-items: center; }" +
  ".image-modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; }" +
  ".image-modal-close svg { width: 24px; height: 24px; color: #6B7280; transition: color 0.2s; }" +
  ".image-modal-close svg:hover { color: #EF4444; }" +
  ".doc-thumbnail { max-width: 100%; height: auto; cursor: pointer; margin-bottom: 1rem; }" +
  ".doc-link-btn { padding: 0.5rem 1rem; border-radius: 8px; border: 2px solid #6366F1; color: #6366F1; transition: all 0.2s; }" +
  ".doc-link-btn:hover { background: #6366F1; color: white; }" +
  "</style>"

if (!document.getElementById("modal-styles")) {
  const style = document.createElement("div")
  style.id = "modal-styles"
  style.innerHTML = modalStyles
  document.head.appendChild(style)
}
