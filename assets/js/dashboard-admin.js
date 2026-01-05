// Dashboard Admin JavaScript

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

// Confirmar agendamento
async function confirmAppointment(id) {
  showEmployeeSelection(id)
}

// Desconfirmar agendamento
async function unconfirmAppointment(appointmentId) {
  if (!confirm("Tem certeza que deseja desconfirmar este agendamento?")) {
    return
  }

  const response = await fetchAPI("/appointments.php", {
    method: "PUT",
    body: JSON.stringify({
      id: appointmentId,
      status: "pending",
      confirmed_by: null,
    }),
  })

  if (response.success) {
    alert("Agendamento desconfirmado com sucesso!")
    location.reload()
  } else {
    alert("Erro ao desconfirmar agendamento: " + response.message)
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

let allEmployees = []

async function loadEmployees() {
  try {
    const url = API_BASE_URL + "/employees.php"
    const response = await fetch(url)
    const data = await response.json()

    if (data.success && data.data) {
      allEmployees = data.data
    } else {
      allEmployees = []
    }
  } catch (error) {
    console.error("[v0] Erro ao carregar funcionários:", error)
    allEmployees = []
  }
}

async function showEmployeeSelection(appointmentId) {
  if (allEmployees.length === 0) {
    await loadEmployees()
  }

  if (allEmployees.length === 0) {
    alert("Nenhum funcionário encontrado no sistema.")
    return
  }

  const employeeButtons = allEmployees
    .map((employee) => {
      const safeName = employee.name.replace(/'/g, "\\'")
      return (
        '<button onclick="confirmAppointmentWithEmployee(' +
        appointmentId +
        "," +
        employee.id +
        ",'" +
        safeName +
        '\')" class="employee-selection-button">' +
        '<div class="employee-info">' +
        '<div class="employee-name">' +
        employee.name +
        "</div>" +
        '<div class="employee-details">' +
        (employee.role || "Funcionário") +
        " - " +
        employee.email +
        "</div>" +
        "</div>" +
        "</button>"
      )
    })
    .join("")

  const modalHTML =
    '<div class="modal-overlay" onclick="closeModal()">' +
    '<div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">' +
    "<h2>Selecione o Funcionário</h2>" +
    '<p class="modal-subtitle">Escolha quem irá atender este agendamento (' +
    allEmployees.length +
    " funcionários disponíveis):</p>" +
    '<div class="employee-selection-grid">' +
    employeeButtons +
    "</div>" +
    '<div class="modal-actions">' +
    '<button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>' +
    "</div>" +
    "</div>" +
    "</div>"

  document.body.insertAdjacentHTML("beforeend", modalHTML)
}

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
    alert("Agendamento confirmado por " + employeeName + "!")
    location.reload()
  } else {
    alert("Erro ao confirmar agendamento: " + response.message)
  }
}

async function markContract(appointmentId) {
  if (!confirm("Confirmar que o contrato foi fechado?")) {
    return
  }

  const response = await fetchAPI("/appointments.php", {
    method: "PUT",
    body: JSON.stringify({
      id: appointmentId,
      status: "closed",
      contract_closed_by: window.employeeId,
    }),
  })

  if (response.success) {
    alert("Contrato marcado como fechado! O horário ficará disponível novamente.")
    location.reload()
  } else {
    alert("Erro ao marcar contrato: " + response.message)
  }
}

function printAppointment(appointmentId) {
  fetchAPI("/appointments.php?id=" + appointmentId)
    .then((response) => {
      if (response.success) {
        const apt = response.data
        const printWindow = window.open("", "_blank")

        const html =
          "<!DOCTYPE html>" +
          "<html>" +
          "<head>" +
          "<title>Agendamento - " +
          apt.name +
          "</title>" +
          "<style>" +
          "body { font-family: Arial, sans-serif; padding: 40px; }" +
          "h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }" +
          ".info { margin: 20px 0; }" +
          ".info-row { display: flex; margin: 10px 0; }" +
          ".label { font-weight: bold; width: 150px; }" +
          ".value { color: #555; }" +
          ".confirmed { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin-top: 20px; }" +
          ".contract-closed { background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin-top: 20px; }" +
          "@media print { body { padding: 20px; } }" +
          "</style>" +
          "</head>" +
          "<body>" +
          "<h1>Detalhes do Agendamento</h1>" +
          '<div class="info">' +
          '<div class="info-row"><span class="label">Nome:</span><span class="value">' +
          apt.name +
          "</span></div>" +
          '<div class="info-row"><span class="label">Email:</span><span class="value">' +
          apt.email +
          "</span></div>" +
          '<div class="info-row"><span class="label">Telefone:</span><span class="value">' +
          apt.phone +
          "</span></div>" +
          '<div class="info-row"><span class="label">Data:</span><span class="value">' +
          formatDate(apt.appointment_date) +
          "</span></div>" +
          '<div class="info-row"><span class="label">Horário:</span><span class="value">' +
          apt.appointment_time +
          "</span></div>" +
          (apt.confirmed_by_name
            ? '<div class="confirmed"><strong>Presença Confirmada</strong><br>Atendente: ' +
              apt.confirmed_by_name +
              "</div>"
            : "") +
          (apt.contract_status === "closed"
            ? '<div class="contract-closed"><strong>Contrato Fechado</strong></div>'
            : "") +
          "</div>" +
          "</body>" +
          "</html>"

        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    })
    .catch((error) => {
      alert("Erro ao buscar dados do agendamento")
      console.error(error)
    })
}

async function showNotesModal(appointmentId) {
  const response = await fetchAPI("/appointments.php?id=" + appointmentId)

  let currentNotes = ""
  if (response.success && response.data) {
    currentNotes = response.data.notes || ""
  }

  const modalHTML =
    '<div class="modal-overlay" onclick="closeModal()">' +
    '<div class="modal-content notes-modal" onclick="event.stopPropagation()">' +
    "<h2>Informações do Agendamento</h2>" +
    '<p class="modal-subtitle">Adicione anotações importantes sobre este agendamento:</p>' +
    '<div class="notes-container">' +
    '<textarea id="appointmentNotes" class="notes-textarea" placeholder="Digite suas anotações aqui..." rows="10">' +
    currentNotes +
    "</textarea>" +
    "</div>" +
    '<div class="modal-actions">' +
    '<button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>' +
    '<button onclick="saveNotes(' +
    appointmentId +
    ')" class="btn btn-primary">Salvar</button>' +
    "</div>" +
    "</div>" +
    "</div>"

  document.body.insertAdjacentHTML("beforeend", modalHTML)

  setTimeout(() => {
    const textarea = document.getElementById("appointmentNotes")
    if (textarea) {
      textarea.focus()
    }
  }, 100)
}

async function saveNotes(appointmentId) {
  const notes = document.getElementById("appointmentNotes").value

  const response = await fetchAPI("/appointments.php", {
    method: "PUT",
    body: JSON.stringify({
      id: appointmentId,
      notes: notes,
    }),
  })

  if (response.success) {
    closeModal()
    alert("Anotações salvas com sucesso!")
    location.reload()
  } else {
    alert("Erro ao salvar anotações: " + response.message)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadEmployees()

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
  "</style>"

if (!document.getElementById("modal-styles")) {
  const style = document.createElement("div")
  style.id = "modal-styles"
  style.innerHTML = modalStyles
  document.head.appendChild(style)
}
