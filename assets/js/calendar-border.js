/**
 * calendar-border.js
 * Aplica borda dourada nos dias selecionaveis do calendario.
 * Roda apos o calendario ser renderizado e tambem observa mudancas dinamicas.
 */
(function () {
    var GOLD = "#b8993e";
    var GOLD_LIGHT = "#d4b44a";
  
    function applyGoldBorders() {
      var allDays = document.querySelectorAll(".calendar-day");
  
      allDays.forEach(function (day) {
        // Pula dias vazios
        if (day.classList.contains("empty")) return;
  
        // Dia desabilitado: sem borda
        if (day.disabled || day.classList.contains("disabled")) {
          day.style.border = "2px solid transparent";
          day.style.color = "rgba(107, 122, 141, 0.25)";
          day.style.cursor = "not-allowed";
          day.style.fontSize = "1.125rem";
          day.style.fontWeight = "700";
          return;
        }
  
        // Dia selecionado: borda dourada forte + fundo dourado
        if (day.classList.contains("selected")) {
          day.style.border = "2px solid " + GOLD;
          day.style.background = GOLD;
          day.style.color = "#0a1628";
          day.style.boxShadow = "0 4px 22px rgba(184, 153, 62, 0.4)";
          day.style.fontWeight = "900";
          day.style.fontSize = "1.125rem";
          return;
        }
  
        // Dia selecionavel: borda dourada visivel
        day.style.border = "2px solid " + GOLD;
        day.style.background = "rgba(19, 31, 51, 0.65)";
        day.style.color = "#e8e8ec";
        day.style.cursor = "pointer";
        day.style.fontWeight = "800";
        day.style.fontSize = "1.125rem";
        day.style.borderRadius = "0.75rem";
        day.style.boxShadow = "0 0 6px rgba(184, 153, 62, 0.12)";
        day.style.transition = "all 0.2s ease";
  
        // Hover: borda mais clara e brilho
        day.addEventListener("mouseenter", function () {
          if (!this.classList.contains("selected")) {
            this.style.borderColor = GOLD_LIGHT;
            this.style.background = "rgba(184, 153, 62, 0.15)";
            this.style.color = GOLD;
            this.style.boxShadow = "0 0 14px rgba(184, 153, 62, 0.25)";
            this.style.transform = "scale(1.08)";
          }
        });
  
        day.addEventListener("mouseleave", function () {
          if (!this.classList.contains("selected")) {
            this.style.borderColor = GOLD;
            this.style.background = "rgba(19, 31, 51, 0.65)";
            this.style.color = "#e8e8ec";
            this.style.boxShadow = "0 0 6px rgba(184, 153, 62, 0.12)";
            this.style.transform = "scale(1)";
          }
        });
      });
    }
  
    // Executa quando o DOM carrega
    document.addEventListener("DOMContentLoaded", function () {
      // Espera um pouco para garantir que o calendario foi renderizado
      setTimeout(applyGoldBorders, 300);
  
      // Observa mudancas no container do calendario (quando muda de mes)
      var calendarContainer = document.getElementById("calendar-days");
      if (calendarContainer) {
        var observer = new MutationObserver(function () {
          setTimeout(applyGoldBorders, 50);
        });
        observer.observe(calendarContainer, { childList: true, subtree: true });
      }
  
      // Tambem re-aplica ao clicar nos botoes de navegacao do mes
      var prevBtn = document.getElementById("prev-month");
      var nextBtn = document.getElementById("next-month");
      if (prevBtn) prevBtn.addEventListener("click", function () { setTimeout(applyGoldBorders, 100); });
      if (nextBtn) nextBtn.addEventListener("click", function () { setTimeout(applyGoldBorders, 100); });
    });
  })();
  