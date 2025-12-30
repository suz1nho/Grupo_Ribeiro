// Dashboard Admin JavaScript

const API_BASE_URL = "/api"

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

    // Atualizar cards de estatísticas se existirem
    updateStatCard("total-appointments", stats.total_appointments)
    updateStatCard("pending-appointments", stats.pending_appointments)
    updateStatCard("confirmed-appointments", stats.confirmed_appointments)
    updateStatCard("new-contacts", stats.new_contacts)
    updateStatCard("pending-analysis", stats.pending_credit_analysis)

    console.log("[v0] Dashboard stats loaded:", stats)
  }
}

// Atualizar card de estatística
function updateStatCard(id, value) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = value || 0
  }
}

// Visualizar detalhes de agendamento
async function viewAppointment(id) {
  const response = await fetchAPI(`/appointments.php?id=${id}`)

  if (response.success) {
    const appointment = response.data

    // Criar modal ou expandir linha com detalhes
    const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <h2>Detalhes do Agendamento</h2>
                    <div class="details-grid">
                        <div><strong>Nome:</strong> ${appointment.name}</div>
                        <div><strong>Email:</strong> ${appointment.email}</div>
                        <div><strong>Telefone:</strong> ${appointment.phone}</div>
                        <div><strong>CPF:</strong> ${appointment.cpf}</div>
                        <div><strong>Data:</strong> ${formatDate(appointment.appointment_date)}</div>
                        <div><strong>Hora:</strong> ${appointment.appointment_time}</div>
                        <div><strong>Status:</strong> ${appointment.status}</div>
                        <div><strong>Análise de Crédito:</strong> ${appointment.credit_analysis ? "Sim" : "Não"}</div>
                        ${appointment.message ? `<div class="full-width"><strong>Mensagem:</strong><br>${appointment.message}</div>` : ""}
                    </div>
                    <button onclick="closeModal()" class="btn btn-primary">Fechar</button>
                </div>
            </div>
        `

    document.body.insertAdjacentHTML("beforeend", modalHTML)
  }
}

// Visualizar detalhes de contato
async function viewContact(id) {
  const response = await fetchAPI(`/contacts.php?id=${id}`)

  if (response.success) {
    const contact = response.data

    const modalHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <h2>Detalhes do Contato</h2>
                    <div class="details-grid">
                        <div><strong>Nome:</strong> ${contact.name}</div>
                        <div><strong>Email:</strong> ${contact.email}</div>
                        <div><strong>Telefone:</strong> ${contact.phone}</div>
                        <div><strong>Status:</strong> ${contact.status}</div>
                        <div class="full-width"><strong>Mensagem:</strong><br>${contact.message}</div>
                    </div>
                    <div class="modal-actions">
                        <button onclick="markContactAsContacted(${id})" class="btn btn-success">Marcar como Contatado</button>
                        <button onclick="closeModal()" class="btn btn-primary">Fechar</button>
                    </div>
                </div>
            </div>
        `

    document.body.insertAdjacentHTML("beforeend", modalHTML)
  }
}

// Marcar contato como contatado
async function markContactAsContacted(id) {
  const response = await fetchAPI("/contacts.php", {
    method: "PUT",
    body: JSON.stringify({
      id: id,
      status: "contacted",
    }),
  })

  if (response.success) {
    closeModal()
    alert("Contato marcado como contatado!")
    location.reload()
  } else {
    alert("Erro ao atualizar contato: " + response.message)
  }
}

// Deletar agendamento
async function deleteAppointment(id) {
  if (!confirm("Tem certeza que deseja deletar este agendamento?")) {
    return
  }

  const response = await fetchAPI("/appointments.php", {
    method: "DELETE",
    body: JSON.stringify({ id: id }),
  })

  if (response.success) {
    alert("Agendamento deletado com sucesso!")
    location.reload()
  } else {
    alert("Erro ao deletar agendamento: " + response.message)
  }
}

// Fechar modal
function closeModal() {
  const modal = document.querySelector(".modal-overlay")
  if (modal) {
    modal.remove()
  }
}

// Formatar data
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

// Formatar data e hora
function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString("pt-BR")
}

let allEmployees = []

async function loadEmployees() {
  console.log("[v0] Iniciando carregamento de funcionários...")

  // Store request details for error logging
  const requestDetails = {
    url: `${API_BASE_URL}/employees.php`,
    method: 'GET',
    timestamp: new Date().toISOString(),
    headers: {
      'Content-Type': 'application/json',
    }
  }

  console.log("[v0] Fazendo requisição para:", requestDetails.url)

  let response = null;
  let responseText = null;

  try {
    response = await fetch(requestDetails.url, {
      method: requestDetails.method,
      headers: requestDetails.headers
    })

    console.log("[v0] Status da resposta:", response.status)
    console.log("[v0] Response OK:", response.ok)
    console.log("[v0] Headers da resposta:", Object.fromEntries([...response.headers.entries()]))

    // Try to get the response text first (for debugging)
    responseText = await response.text();
    console.log("[v0] Resposta bruta (texto):", responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[v0] Falha ao fazer parse da resposta como JSON:", parseError);
      throw new Error(`Resposta inválida do servidor (não é JSON). Resposta: ${responseText}`);
    }

    console.log("[v0] Dados recebidos (JSON parseado):", data)
    console.log("[v0] Sucesso:", data.success)
    console.log("[v0] Data.data existe:", !!data.data)
    console.log("[v0] Número de funcionários:", data.data ? data.data.length : 0)

    if (data.success && data.data) {
      allEmployees = data.data
      console.log("[v0] Funcionários carregados com sucesso:", allEmployees)
      console.log("[v0] Total de funcionários:", allEmployees.length)
    } else {
      console.error("[v0] Falha ao carregar funcionários:", data.message)
      console.error("[v0] Conteúdo completo da resposta de erro:", data)
      allEmployees = []
    }
  } catch (error) {
    console.error("[v0] === ERRO DETECTADO ===")
    console.error("[v0] Tipo de erro:", error.name)
    console.error("[v0] Mensagem de erro:", error.message)

    // Log the stack trace if available
    if (error.stack) {
      console.error("[v0] Stack do erro:", error.stack)
    }

    console.error("[v0] === DETALHES DA REQUISIÇÃO ===")
    console.error("[v0] URL:", requestDetails.url)
    console.error("[v0] Método:", requestDetails.method)
    console.error("[v0] Timestamp:", requestDetails.timestamp)
    console.error("[v0] Headers:", JSON.stringify(requestDetails.headers, null, 2))
    console.error("[v0] API_BASE_URL (valor atual):", API_BASE_URL)

    console.error("[v0] === CONTEÚDO DA RESPOSTA ===")
    if (response) {
      console.error("[v0] Status da resposta:", response.status)
      console.error("[v0] Status text:", response.statusText)
      console.error("[v0] Response headers:", Object.fromEntries([...response.headers.entries()]))
    }

    if (responseText !== null) {
      console.error("[v0] Conteúdo da resposta (texto bruto):", responseText)
      console.error("[v0] Tamanho da resposta:", responseText.length, "caracteres")

      // Try to display as JSON if possible
      try {
        const parsedResponse = JSON.parse(responseText);
        console.error("[v0] Conteúdo da resposta (JSON parseado):", JSON.stringify(parsedResponse, null, 2))
      } catch (e) {
        console.error("[v0] Resposta não é JSON válido")
        // Show first 500 characters if response is too long
        console.error("[v0] Primeiros 500 caracteres da resposta:",
          responseText.length > 500 ? responseText.substring(0, 500) + "..." : responseText)
      }
    } else {
      console.error("[v0] Nenhum conteúdo de resposta disponível (possível erro de rede)")
    }

    // Additional debugging info
    console.error("[v0] === INFO ADICIONAL PARA DEBUG ===")
    console.error("[v0] Tipo da API_BASE_URL:", typeof API_BASE_URL)
    console.error("[v0] API_BASE_URL está definida?", typeof API_BASE_URL !== 'undefined')
    console.error("[v0] URL completa montada:", requestDetails.url)

    allEmployees = []

    // Re-throw the error if you want to handle it further up the call stack
    // throw error;
  }
}

async function showEmployeeSelection(appointmentId) {
  console.log("[v0] showEmployeeSelection chamado para agendamento:", appointmentId)
  console.log("[v0] Funcionários em cache:", allEmployees.length)

  // Ensure employees are loaded
  if (allEmployees.length === 0) {
    console.log("[v0] Nenhum funcionário em cache, carregando...")
    await loadEmployees()
  }

  console.log("[v0] Total de funcionários após carregamento:", allEmployees.length)

  if (allEmployees.length === 0) {
    console.error("[v0] ERRO: Nenhum funcionário encontrado!")
    alert("Nenhum funcionário encontrado no sistema. Verifique o console para mais detalhes.")
    return
  }

  console.log("[v0] Criando botões para funcionários:", allEmployees)

  // Create modal with all employees
  const employeeButtons = allEmployees
    .map((employee) => {
      console.log("[v0] Criando botão para:", employee.name)
      return `
    <button 
      onclick="confirmAppointmentWithEmployee(${appointmentId}, ${employee.id}, '${employee.name.replace(/'/g, "\\'")}')"
      class="employee-selection-button"
    >
      <div class="employee-info">
        <div class="employee-name">${employee.name}</div>
        <div class="employee-details">${employee.role || "Funcionário"} - ${employee.email}</div>
      </div>
    </button>
  `
    })
    .join("")

  const modalHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">
        <h2>Selecione o Funcionário</h2>
        <p class="modal-subtitle">Escolha quem irá atender este agendamento (${allEmployees.length} funcionários disponíveis):</p>
        <div class="employee-selection-grid">
          ${employeeButtons}
        </div>
        <div class="modal-actions">
          <button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  `

  document.body.insertAdjacentHTML("beforeend", modalHTML)
}

// Confirmar agendamento com funcionário
async function confirmAppointmentWithEmployee(appointmentId, employeeId, employeeName) {
  const response = await fetchAPI("/appointments.php", {
    method: "PUT",
    body: JSON.stringify({
      id: appointmentId,
      status: "confirmed",
      confirmed_by: employeeId,
    }),
  })

  if (response.success) {
    closeModal()
    alert(`Agendamento confirmado por ${employeeName}!`)
    location.reload()
  } else {
    alert("Erro ao confirmar agendamento: " + response.message)
  }
}

// Inicializar dashboard quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Dashboard admin initialized")

  console.log("[v0] Carregando funcionários na inicialização...")
  loadEmployees()

  // Carregar estatísticas
  if (document.getElementById("appointments-tbody")) {
    loadDashboardStats()
  }

  // Auto-refresh a cada 30 segundos
  setInterval(loadDashboardStats, 30000)
})

// CSS adicional para o modal
const modalStyles = `
    <style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-content h2 {
        margin-bottom: 1.5rem;
        color: #111827;
    }
    
    .modal-subtitle {
        color: #6B7280;
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
    }
    
    .employee-selection-modal {
        max-width: 700px;
    }
    
    .employee-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        max-height: 500px;
        overflow-y: auto;
        padding: 0.5rem;
    }
    
    .employee-selection-button {
        background: #F3F4F6;
        border: 2px solid #E5E7EB;
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
        width: 100%;
    }
    
    .employee-selection-button:hover {
        background: #EEF2FF;
        border-color: #6366F1;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .employee-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .employee-name {
        font-weight: 600;
        color: #111827;
        font-size: 1rem;
    }
    
    .employee-details {
        font-size: 0.85rem;
        color: #6B7280;
    }
    
    .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .details-grid .full-width {
        grid-column: 1 / -1;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
    }
    
    .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
    }
    
    .btn-primary {
        background: #6366F1;
        color: white;
    }
    
    .btn-primary:hover {
        background: #4F46E5;
    }
    
    .btn-secondary {
        background: #E5E7EB;
        color: #374151;
    }
    
    .btn-secondary:hover {
        background: #D1D5DB;
    }
    
    .btn-success {
        background: #10B981;
        color: white;
    }
    
    .btn-success:hover {
        background: #059669;
    }
    </style>
`

if (!document.getElementById("modal-styles")) {
  const style = document.createElement("div")
  style.id = "modal-styles"
  style.innerHTML = modalStyles
  document.head.appendChild(style)
}
