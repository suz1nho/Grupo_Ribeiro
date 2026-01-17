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
  const appointmentResponse = await fetchAPI("/appointments.php?id=" + appointmentId)

  if (!appointmentResponse.success || !appointmentResponse.data) {
    alert("Erro ao buscar dados do agendamento")
    return
  }

  const appointment = appointmentResponse.data

  const response = await fetchAPI("/appointments.php", {
    method: "PUT",
    body: JSON.stringify({
      id: appointmentId,
      status: "approved",
      confirmed_by: employeeId,
    }),
  })

  if (response.success) {
    closeModal()

    sendWhatsAppMessage(appointment, employeeName)

    alert("Agendamento confirmado por " + employeeName + "!")
    location.reload()
  } else {
    alert("Erro ao confirmar agendamento: " + response.message)
  }
}

function sendWhatsAppMessage(appointment, employeeName) {
  // Formatar a data do agendamento para formato brasileiro
  const appointmentDate = new Date(appointment.appointment_date + "T00:00:00")
  const formattedDate = appointmentDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  // Formatar o horário
  const formattedTime = appointment.appointment_time

  // Montar a mensagem
  const message = `Olá, ${appointment.name}! O seu agendamento foi confirmado para o dia ${formattedDate} no horário ${formattedTime}. Aguardamos você!`

  // Limpar o telefone (remover caracteres não numéricos)
  const cleanPhone = appointment.phone.replace(/\D/g, "")

  // Montar URL do WhatsApp
  // Se o telefone não tiver código do país, adicionar +55 (Brasil)
  const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone
  const whatsappURL = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`

  // Abrir WhatsApp em nova aba
  window.open(whatsappURL, "_blank")
}

// Marcar contrato como fechado
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

// Confirmar análise de crédito - Abre modal de seleção de funcionário
async function confirmCreditAnalysis(analysisId) {
  const response = await fetchAPI("/credit-analysis.php?action=employees")

  if (!response.success || !response.data) {
    alert("Erro ao carregar funcionários")
    return
  }

  const employees = response.data

  // Criar modal de seleção de funcionário
  const modalHTML =
    '<div class="modal-overlay" onclick="closeModal()">' +
    '<div class="modal-content employee-selection-modal" onclick="event.stopPropagation()">' +
    "<h2>Selecionar Funcionário Responsável</h2>" +
    '<p class="modal-subtitle">Escolha o funcionário que será responsável por esta análise de crédito:</p>' +
    '<div class="employee-selection-grid">' +
    employees
      .map(
        (emp) =>
          '<button class="employee-selection-button" onclick="executeCreditConfirmation(' +
          analysisId +
          ", " +
          emp.id +
          ')">' +
          '<div class="employee-info">' +
          '<div class="employee-name">' +
          emp.name +
          "</div>" +
          '<div class="employee-details">' +
          (emp.role || "Funcionário") +
          "</div>" +
          "</div>" +
          "</button>",
      )
      .join("") +
    "</div>" +
    '<div class="modal-actions">' +
    '<button onclick="closeModal()" class="btn btn-secondary">Cancelar</button>' +
    "</div>" +
    "</div>" +
    "</div>"

  document.body.insertAdjacentHTML("beforeend", modalHTML)
}

// Executar confirmação da análise de crédito após selecionar funcionário
async function executeCreditConfirmation(analysisId, employeeId) {
  closeModal()

  const analysisResponse = await fetchAPI("/credit-analysis.php?id=" + analysisId)

  if (!analysisResponse.success || !analysisResponse.data) {
    alert("Erro ao buscar dados da análise de crédito")
    return
  }

  const analysis = analysisResponse.data

  const response = await fetchAPI("/credit-analysis.php", {
    method: "PUT",
    body: JSON.stringify({
      id: analysisId,
      status: "approved",
      analyzed_by: employeeId,
    }),
  })

  if (response.success) {
    sendCreditAnalysisWhatsAppMessage(analysis)

    alert("Análise de crédito confirmada com sucesso!")
    location.reload()
  } else {
    alert("Erro ao confirmar análise: " + response.message)
  }
}

function sendCreditAnalysisWhatsAppMessage(analysis) {
  // Formatar valor solicitado
  const formattedAmount = Number.parseFloat(analysis.requested_amount).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  // Montar a mensagem
  const message = `Olá, ${analysis.name}! A sua análise de crédito foi confirmada! ✅\n\nValor solicitado: ${formattedAmount}\n\nEntre em contato conosco para darmos continuidade ao seu processo. Aguardamos você!`

  // Limpar o telefone (remover caracteres não numéricos)
  const cleanPhone = analysis.phone.replace(/\D/g, "")

  // Montar URL do WhatsApp
  // Se o telefone não tiver código do país, adicionar +55 (Brasil)
  const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone
  const whatsappURL = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`

  // Abrir WhatsApp em nova aba
  window.open(whatsappURL, "_blank")
}

// Atualizar status da análise de crédito (Pendente, Aprovado, Rejeitado)
async function updateCreditStatus(analysisId, status) {
  const statusLabels = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  }

  if (!confirm("Confirmar alteração do status para: " + statusLabels[status] + "?")) {
    return
  }

  const response = await fetchAPI("/credit-analysis.php", {
    method: "PUT",
    body: JSON.stringify({
      id: analysisId,
      status: status,
    }),
  })

  if (response.success) {
    alert("Status atualizado com sucesso!")
    location.reload()
  } else {
    alert("Erro ao atualizar status: " + response.message)
  }
}

// Desmarcar análise de crédito
async function unconfirmCreditAnalysis(analysisId) {
  if (!confirm("Deseja desmarcar esta análise de crédito? O funcionário responsável será removido.")) {
    return
  }

  const response = await fetchAPI("/credit-analysis.php", {
    method: "PUT",
    body: JSON.stringify({
      id: analysisId,
      status: "pending",
      analyzed_by: null,
    }),
  })

  if (response.success) {
    alert("Análise desmarcada com sucesso!")
    location.reload()
  } else {
    alert("Erro ao desmarcar análise: " + response.message)
  }
}

// Ver documentos da análise de crédito
async function viewCreditDocuments(analysisId) {
  const response = await fetchAPI("/credit-analysis.php?id=" + analysisId)

  if (!response.success || !response.data) {
    alert("Erro ao carregar documentos")
    return
  }

  const analysis = response.data

  // Função auxiliar para gerar preview de documento
  function getDocumentPreview(docPath, docName) {
    if (!docPath) {
      return (
        '<div class="document-item no-doc">' +
        '<span class="doc-label">' +
        docName +
        ":</span> " +
        '<span class="doc-status">Não enviado</span>' +
        "</div>"
      )
    }

    const fullPath = "../uploads/credit-analysis/" + docPath
    const ext = docPath.split(".").pop().toLowerCase()
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)

    if (isImage) {
      return (
        '<div class="document-item has-doc">' +
        '<span class="doc-label">' +
        docName +
        ":</span>" +
        '<div class="doc-image-container">' +
        '<img src="' +
        fullPath +
        '" alt="' +
        docName +
        '" class="doc-thumbnail" onclick="openDocumentImage(\'' +
        fullPath +
        "')\">" +
        '<a href="' +
        fullPath +
        '" target="_blank" class="doc-link-btn">Abrir em nova aba</a>' +
        "</div>" +
        "</div>"
      )
    } else {
      return (
        '<div class="document-item has-doc">' +
        '<span class="doc-label">' +
        docName +
        ":</span> " +
        '<a href="' +
        fullPath +
        '" target="_blank" class="doc-link">Ver documento (PDF)</a>' +
        "</div>"
      )
    }
  }

  // Criar modal com documentos
  const modalHTML =
    '<div class="modal-overlay" onclick="closeModal()">' +
    '<div class="modal-content documents-modal" onclick="event.stopPropagation()">' +
    "<h2>Documentos da Análise de Crédito</h2>" +
    '<div class="client-info-section">' +
    "<p><strong>Nome:</strong> " +
    (analysis.name || "Não informado") +
    "</p>" +
    "<p><strong>Email:</strong> " +
    (analysis.email || "Não informado") +
    "</p>" +
    "<p><strong>Telefone:</strong> " +
    (analysis.phone || "Não informado") +
    "</p>" +
    "</div>" +
    '<hr style="margin: 15px 0; border: none; border-top: 1px solid #e5e7eb;">' +
    '<h3 style="margin-bottom: 15px; color: #374151;">Documentos Enviados</h3>' +
    '<div class="documents-grid">' +
    getDocumentPreview(analysis.doc_identidade, "CPF e RG ou CNH") +
    getDocumentPreview(analysis.doc_endereco, "Comprovante de Endereço") +
    getDocumentPreview(analysis.doc_renda, "Comprovante de Renda") +
    getDocumentPreview(analysis.doc_bancario, "Dados Bancários") +
    "</div>" +
    '<div class="modal-actions">' +
    '<button onclick="closeModal()" class="btn btn-primary">Fechar</button>' +
    "</div>" +
    "</div>" +
    "</div>"

  document.body.insertAdjacentHTML("beforeend", modalHTML)
}

function openDocumentImage(imageSrc) {
  const imageModal = document.createElement("div")
  imageModal.className = "image-modal-overlay"
  imageModal.innerHTML =
    '<div class="image-modal-content">' +
    '<button class="image-modal-close" onclick="this.closest(\'.image-modal-overlay\').remove()">' +
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' +
    "</svg>" +
    "</button>" +
    '<img src="' +
    imageSrc +
    '" alt="Documento">' +
    "</div>"

  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.remove()
    }
  })

  document.body.appendChild(imageModal)
}

// Deletar análise de crédito (apenas para administrativos)
async function deleteCreditAnalysis(analysisId) {
  if (!confirm("ATENÇÃO: Deseja realmente deletar esta análise de crédito? Esta ação não pode ser desfeita!")) {
    return
  }

  const response = await fetchAPI("/credit-analysis.php", {
    method: "DELETE",
    body: JSON.stringify({
      id: analysisId,
    }),
  })

  if (response.success) {
    alert("Análise de crédito deletada com sucesso!")
    location.reload()
  } else {
    alert("Erro ao deletar análise: " + response.message)
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
