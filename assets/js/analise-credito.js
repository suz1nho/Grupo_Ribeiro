document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("creditAnalysisForm")
    const phoneInput = document.getElementById("telefone")
    const formAlert = document.getElementById("formAlert")
  
    // File input fields
    const fileInputs = {
      identidade: document.getElementById("docIdentidade"),
      endereco: document.getElementById("docEndereco"),
      renda: document.getElementById("docRenda"),
      bancario: document.getElementById("docBancario"),
    }
  
    // Preview containers
    const previewContainers = {
      identidade: document.getElementById("previewIdentidade"),
      endereco: document.getElementById("previewEndereco"),
      renda: document.getElementById("previewRenda"),
      bancario: document.getElementById("previewBancario"),
    }
  
    // "Não tenho" buttons
    const naoTenhoButtons = document.querySelectorAll(".btn-nao-tenho")
  
    // Track which fields have "não tenho" active
    const naoTenhoActive = {
      identidade: false,
      endereco: false,
      renda: false,
      bancario: false,
    }
  
    // Phone mask
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      if (value.length > 11) value = value.slice(0, 11)
  
      if (value.length > 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`
      } else if (value.length > 0) {
        value = `(${value}`
      }
  
      e.target.value = value
    })
  
    // File input change handlers
    Object.keys(fileInputs).forEach((field) => {
      fileInputs[field].addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (file) {
          displayFilePreview(field, file)
          // If file is uploaded, deactivate "não tenho"
          if (naoTenhoActive[field]) {
            toggleNaoTenho(field)
          }
        }
      })
    })
  
    // "Não tenho" button handlers
    naoTenhoButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault()
        const field = this.getAttribute("data-field")
        toggleNaoTenho(field)
      })
    })
  
    function toggleNaoTenho(field) {
      const button = document.querySelector(`.btn-nao-tenho[data-field="${field}"]`)
      const preview = previewContainers[field]
      const fileInput = fileInputs[field]
  
      if (!naoTenhoActive[field]) {
        // Activate "não tenho"
        naoTenhoActive[field] = true
        button.classList.add("active")
        button.textContent = "Desfazer"
  
        // Clear file input
        fileInput.value = ""
  
        // Show "não tenho" message
        preview.classList.add("has-file")
        preview.innerHTML = `
                  <div class="no-doc-message">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <p>Documento não disponível</p>
                  </div>
              `
      } else {
        // Deactivate "não tenho"
        naoTenhoActive[field] = false
        button.classList.remove("active")
        button.textContent = "Não tenho"
  
        // Clear preview
        preview.classList.remove("has-file")
        preview.innerHTML = ""
      }
    }
  
    function displayFilePreview(field, file) {
      const preview = previewContainers[field]
      const maxSize = 5 * 1024 * 1024 // 5MB
  
      if (file.size > maxSize) {
        showAlert("Arquivo muito grande. O tamanho máximo é 5MB.", "error")
        fileInputs[field].value = ""
        return
      }
  
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        showAlert("Tipo de arquivo não permitido. Use apenas JPEG, PNG ou PDF.", "error")
        fileInputs[field].value = ""
        return
      }
  
      preview.classList.add("has-file")
  
      const fileSize = formatFileSize(file.size)
      const fileName = file.name
  
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          preview.innerHTML = `
                      <div class="file-preview-content">
                          <img src="${e.target.result}" alt="Preview" class="preview-image" onclick="openImageModal('${e.target.result}')">
                          <div class="file-info">
                              <p class="file-name">${fileName}</p>
                              <p class="file-size">${fileSize}</p>
                          </div>
                          <button type="button" class="file-remove" onclick="removeFile('${field}')">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                          </button>
                      </div>
                  `
        }
        reader.readAsDataURL(file)
      } else {
        preview.innerHTML = `
                  <div class="file-preview-content">
                      <div style="width: 80px; height: 80px; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <line x1="10" y1="9" x2="8" y2="9"/>
                          </svg>
                      </div>
                      <div class="file-info">
                          <p class="file-name">${fileName}</p>
                          <p class="file-size">${fileSize}</p>
                      </div>
                      <button type="button" class="file-remove" onclick="removeFile('${field}')">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                      </button>
                  </div>
              `
      }
    }
  
    window.removeFile = (field) => {
      fileInputs[field].value = ""
      previewContainers[field].classList.remove("has-file")
      previewContainers[field].innerHTML = ""
    }
  
    window.openImageModal = (imageSrc) => {
      const modal = document.createElement("div")
      modal.className = "image-modal"
      modal.innerHTML = `
              <div class="image-modal-content">
                  <button class="image-modal-close" onclick="this.closest('.image-modal').remove()">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                  </button>
                  <img src="${imageSrc}" alt="Preview">
              </div>
          `
  
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.remove()
        }
      })
  
      document.body.appendChild(modal)
    }
  
    function formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
    }
  
    function showAlert(message, type) {
      formAlert.className = `form-alert ${type} show`
      formAlert.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  ${
                    type === "success"
                      ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                      : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
                  }
              </svg>
              ${message}
          `
  
      setTimeout(() => {
        formAlert.classList.remove("show")
      }, 5000)
    }
  
    // Form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      const telefone = phoneInput.value.replace(/\D/g, "")
  
      if (telefone.length < 10) {
        showAlert("Por favor, insira um número de telefone válido.", "error")
        return
      }
  
      // Check if at least one document is provided or "não tenho" is selected
      const hasAnyFile = Object.keys(fileInputs).some(
        (field) => fileInputs[field].files.length > 0 || naoTenhoActive[field],
      )
  
      if (!hasAnyFile) {
        showAlert(
          'Por favor, envie pelo menos um documento ou marque "Não tenho" para os documentos não disponíveis.',
          "error",
        )
        return
      }
  
      const formData = new FormData()
      formData.append("telefone", telefone)
  
      // Add files only if they exist and "não tenho" is not active
      Object.keys(fileInputs).forEach((field) => {
        if (fileInputs[field].files.length > 0 && !naoTenhoActive[field]) {
          formData.append(`doc_${field}`, fileInputs[field].files[0])
        }
      })
  
      const submitBtn = form.querySelector(".btn-submit")
      const originalText = submitBtn.textContent
      submitBtn.disabled = true
      submitBtn.innerHTML = `
              <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              Enviando...
          `
  
      try {
        const response = await fetch("api/credit-analysis.php", {
          method: "POST",
          body: formData,
        })
  
        const result = await response.json()
  
        if (result.success) {
          showAlert("Análise de crédito enviada com sucesso! Entraremos em contato em breve.", "success")
  
          // Reset form after 2 seconds
          setTimeout(() => {
            form.reset()
            Object.keys(previewContainers).forEach((field) => {
              previewContainers[field].classList.remove("has-file")
              previewContainers[field].innerHTML = ""
            })
            Object.keys(naoTenhoActive).forEach((field) => {
              if (naoTenhoActive[field]) {
                toggleNaoTenho(field)
              }
            })
          }, 2000)
        } else {
          showAlert(result.message || "Erro ao enviar análise. Tente novamente.", "error")
        }
      } catch (error) {
        console.error("[v0] Error submitting form:", error)
        showAlert("Erro ao enviar análise. Verifique sua conexão e tente novamente.", "error")
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      }
    })
  })
  