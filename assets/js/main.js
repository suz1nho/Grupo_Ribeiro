document.addEventListener("DOMContentLoaded", () => {
  // Calendar and Scheduling System
  const calendarDays = document.getElementById("calendar-days")
  const currentMonthYear = document.getElementById("current-month-year")
  const prevMonthBtn = document.getElementById("prev-month")
  const nextMonthBtn = document.getElementById("next-month")
  const timeSlotsContainer = document.getElementById("time-slots")
  const selectedDateDisplay = document.getElementById("selected-date-display")
  const formDateDisplay = document.getElementById("form-date-display")
  const formTimeDisplay = document.getElementById("form-time-display")

  const currentDate = new Date()
  let selectedDate = null
  let selectedTime = null

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  // Available time slots (8am to 6pm, every hour interval)
  const timeSlots = [
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
  ]

  function renderCalendar() {
    if (!calendarDays || !currentMonthYear) return

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    currentMonthYear.textContent = `${months[month]} ${year}`

    const firstDay = new Date(year, month, 1).getDay()
    const lastDate = new Date(year, month + 1, 0).getDate()

    calendarDays.innerHTML = ""

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("button")
      emptyDay.className = "calendar-day empty"
      emptyDay.disabled = true
      calendarDays.appendChild(emptyDay)
    }

    // Days of the month
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 30)

    for (let day = 1; day <= lastDate; day++) {
      const dayDate = new Date(year, month, day)
      dayDate.setHours(0, 0, 0, 0)

      const dayButton = document.createElement("button")
      dayButton.className = "calendar-day"
      dayButton.textContent = day
      dayButton.dataset.date = dayDate.toISOString().split("T")[0]

      // Disable past dates and dates beyond 30 days
      if (dayDate < today || dayDate > maxDate) {
        dayButton.disabled = true
      } else {
        dayButton.addEventListener("click", function () {
          selectDate(this)
        })
      }

      calendarDays.appendChild(dayButton)
    }
  }

  function selectDate(dayElement) {
    // Remove previous selection
    document.querySelectorAll(".calendar-day").forEach((day) => {
      day.classList.remove("selected")
      day.style.background = ""
    })

    // Mark as selected
    dayElement.classList.add("selected")
    dayElement.style.background = "var(--accent)"

    selectedDate = dayElement.dataset.date

    // Format date for display
    const dateObj = new Date(selectedDate + "T00:00:00")
    const formattedDate = `${dateObj.getDate()} de ${months[dateObj.getMonth()]} de ${dateObj.getFullYear()}`
    selectedDateDisplay.textContent = formattedDate
    formDateDisplay.textContent = formattedDate

    // Move to time selection step
    showStep("time-step")
    renderTimeSlots()
  }

  function renderTimeSlots() {
    if (!timeSlotsContainer) return

    timeSlotsContainer.innerHTML = ""

    // All time slots are available
    timeSlots.forEach((time) => {
      const timeButton = document.createElement("button")
      timeButton.className = "time-slot"
      timeButton.textContent = time
      timeButton.dataset.time = time

      timeButton.addEventListener("click", function () {
        selectTime(this)
      })

      timeSlotsContainer.appendChild(timeButton)
    })
  }

  function selectTime(timeElement) {
    // Remove previous selection
    document.querySelectorAll(".time-slot").forEach((slot) => {
      slot.classList.remove("selected")
      slot.style.background = ""
    })

    // Mark as selected
    timeElement.classList.add("selected")
    timeElement.style.background = "var(--accent)"

    selectedTime = timeElement.dataset.time
    formTimeDisplay.textContent = selectedTime

    // Move to form step
    showStep("form-step")
  }

  function showStep(stepId) {
    document.querySelectorAll(".step-content").forEach((step) => {
      step.classList.remove("active")
    })
    document.getElementById(stepId).classList.add("active")
  }

  // Navigation buttons
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1)
      renderCalendar()
    })
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1)
      renderCalendar()
    })
  }

  const backToCalendarBtn = document.getElementById("back-to-calendar")
  if (backToCalendarBtn) {
    backToCalendarBtn.addEventListener("click", () => {
      showStep("calendar-step")
    })
  }

  const backToTimeBtn = document.getElementById("back-to-time")
  if (backToTimeBtn) {
    backToTimeBtn.addEventListener("click", () => {
      showStep("time-step")
    })
  }

  // Initialize calendar
  renderCalendar()
})
