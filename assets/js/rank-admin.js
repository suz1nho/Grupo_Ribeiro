// Rank Admin JavaScript

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
    console.error("Erro na requisição:", error)
    return { success: false, message: "Erro na comunicação com o servidor" }
  }
}

// Carregar ranking de funcionários
async function loadEmployeeRanking() {
  const response = await fetchAPI("/stats.php")

  if (response.success && response.data.employee_ranking) {
    const ranking = response.data.employee_ranking
    displayRanking(ranking)
  }
}

// Exibir ranking na página
function displayRanking(ranking) {
  const container = document.getElementById("ranking-container")
  if (!container) return

  container.innerHTML = ""

  ranking.forEach((employee, index) => {
    const position = index + 1
    let rankClass = ""
    let medal = ""

    if (position === 1) {
      rankClass = "gold"
      medal = "🥇"
    } else if (position === 2) {
      rankClass = "silver"
      medal = "🥈"
    } else if (position === 3) {
      rankClass = "bronze"
      medal = "🥉"
    }

    const confirmationRate =
      employee.total_confirmations > 0 ? ((employee.confirmed / employee.total_confirmations) * 100).toFixed(1) : 0

    const cardHTML = `
            <div class="rank-card ${rankClass}">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-4">
                        <div class="text-4xl font-bold text-gray-400">#${position}</div>
                        <div>
                            <h3 class="text-xl font-bold">${medal} ${employee.name}</h3>
                            <p class="text-sm text-gray-600">ID: ${employee.id}</p>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 mt-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${employee.confirmed}</div>
                        <div class="text-xs text-gray-600">Confirmados</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${employee.total_confirmations}</div>
                        <div class="text-xs text-gray-600">Total</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${confirmationRate}%</div>
                        <div class="text-xs text-gray-600">Taxa</div>
                    </div>
                </div>
            </div>
        `

    container.insertAdjacentHTML("beforeend", cardHTML)
  })
}

// Alternar período de visualização
function togglePeriod(period) {
  const buttons = document.querySelectorAll(".period-btn")
  buttons.forEach((btn) => btn.classList.remove("active"))

  event.target.classList.add("active")

  // Aqui você pode implementar a lógica para filtrar por período
  console.log("[v0] Period selected:", period)
  loadEmployeeRanking()
}

// Inicializar página de ranking
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Rank admin initialized")

  if (document.getElementById("ranking-container")) {
    loadEmployeeRanking()

    // Atualizar a cada 60 segundos
    setInterval(loadEmployeeRanking, 60000)
  }
})
