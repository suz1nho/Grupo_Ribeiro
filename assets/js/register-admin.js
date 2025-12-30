// Register Admin JavaScript

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
    console.error("Erro na requisição:", error)
    return { success: false, message: "Erro na comunicação com o servidor" }
  }
}

// Validar CPF
function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, "")

  if (cpf.length !== 11) return false

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Validar primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== Number.parseInt(cpf.charAt(9))) return false

  // Validar segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== Number.parseInt(cpf.charAt(10))) return false

  return true
}

// Validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Formatar CPF
function formatCPF(value) {
  value = value.replace(/\D/g, "")
  value = value.substring(0, 11)
  value = value.replace(/(\d{3})(\d)/, "$1.$2")
  value = value.replace(/(\d{3})(\d)/, "$1.$2")
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  return value
}

// Formatar telefone
function formatPhone(value) {
  value = value.replace(/\D/g, "")
  value = value.substring(0, 11)
  if (value.length <= 10) {
    value = value.replace(/(\d{2})(\d)/, "($1) $2")
    value = value.replace(/(\d{4})(\d)/, "$1-$2")
  } else {
    value = value.replace(/(\d{2})(\d)/, "($1) $2")
    value = value.replace(/(\d{5})(\d)/, "$1-$2")
  }
  return value
}

// Cadastrar funcionário
async function registerEmployee(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    cpf: formData.get("cpf").replace(/\D/g, ""),
    phone: formData.get("phone").replace(/\D/g, ""),
    position: formData.get("position"),
    emergency_contact: formData.get("emergency_contact"),
    address: formData.get("address"),
    role: formData.get("role"),
    hired_date: formData.get("hired_date"),
    birth_date: formData.get("birth_date"),
    status: "active",
  }

  // Validações
  if (!data.name || data.name.length < 3) {
    alert("Nome deve ter pelo menos 3 caracteres")
    return
  }

  if (!validateEmail(data.email)) {
    alert("Email inválido")
    return
  }

  if (!data.password || data.password.length < 6) {
    alert("Senha deve ter pelo menos 6 caracteres")
    return
  }

  // Enviar para a API
  const submitBtn = form.querySelector('button[type="submit"]')
  submitBtn.disabled = true
  submitBtn.textContent = "Cadastrando..."

  const response = await fetchAPI("/employees.php", {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (response.success) {
    alert("Funcionário cadastrado com sucesso!")
    form.reset()
  } else {
    alert("Erro ao cadastrar funcionário: " + response.message)
  }

  submitBtn.disabled = false
  submitBtn.textContent = "Cadastrar Funcionário"
}

// Aplicar máscaras aos campos
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Register admin initialized")

  // Máscara para CPF
  const cpfInput = document.getElementById("cpf")
  if (cpfInput) {
    cpfInput.addEventListener("input", (e) => {
      e.target.value = formatCPF(e.target.value)
    })
  }

  // Máscara para telefone
  const phoneInput = document.getElementById("phone")
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      e.target.value = formatPhone(e.target.value)
    })
  }

  // Validação do formulário
  const registerForm = document.getElementById("register-form")
  if (registerForm) {
    registerForm.addEventListener("submit", registerEmployee)
  }
})
