// ========== DATA ==========
const brands = [
  "TOYOTA","HONDA","VOLKSWAGEN","CHEVROLET","FIAT","HYUNDAI","YAMAHA","BMW",
  "MERCEDES-BENZ","KAWASAKI","JEEP","RENAULT","SUZUKI","NISSAN","DUCATI","HARLEY-DAVIDSON"
];

const carouselSlides = [
  { title:"consórcio de Automoveis", desc:"Seu carro zero ou seminovo com parcelas que cabem no bolso. Creditos de R$ 30 mil a R$ 300 mil.", image:"images/consorcio-auto_copy.jpg", icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>', credit:"Ate R$ 300 mil", parcelas:"Ate 80x", taxa:"A partir de 0,75% a.m." },
  { title:"Consórcio de Imoveis", desc:"A casa dos seus sonhos esta mais perto do que voce imagina. Creditos de R$ 100 mil a R$ 1 milhao.", image:"images/consorcio-imovel.jpg", icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', credit:"Ate R$ 1 milhao", parcelas:"Ate 200x", taxa:"A partir de 0,50% a.m." },
  { title:"Consórcio de Motos", desc:"Duas rodas de liberdade com as melhores condicoes. Creditos de R$ 10 mil a R$ 50 mil.", image:"images/consorcio-moto.jpg", icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3.5-3.5 2-1.5 3.5 3.5H18"/></svg>', credit:"Ate R$ 50 mil", parcelas:"Ate 70x", taxa:"A partir de 0,80% a.m." },
  { title:"Veiculos Pesados", desc:"Caminhoes e maquinarios para expandir seu negocio. Creditos de R$ 100 mil a R$ 500 mil.", image:"images/consorcio-pesado.jpg", icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2l4-6h-6"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/></svg>', credit:"Ate R$ 500 mil", parcelas:"Ate 100x", taxa:"A partir de 0,60% a.m." }
];

const benefitsData = [
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>', title:"Zero Juros", desc:"Diferente do financiamento, no consorcio voce nao paga juros. Apenas uma taxa administrativa reduzida." },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>', title:"Seguranca Garantida", desc:"Regulamentado pelo Banco Central do Brasil. Seu dinheiro esta protegido por lei." },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>', title:"Poder de Compra", desc:"Sua carta de credito tem poder de compra a vista, garantindo os melhores descontos na hora da compra." },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', title:"Parcelas Flexiveis", desc:"Planos de ate 200 meses para imoveis e ate 80 meses para veiculos. Parcelas que cabem no seu bolso." },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>', title:"Contemplacao Garantida", desc:"Todos os participantes sao contemplados ao final do plano. Voce tambem pode antecipar por lance." },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', title:"50 Anos de Experiencia", desc:"Meio seculo de historia no mercado de consorcios. Solidez, credibilidade e mais de 500 mil clientes satisfeitos." }
];

const stepsData = [
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>', step:"01", title:"Escolha seu Plano", desc:"Selecione o tipo de consorcio e o valor do credito que melhor se adapta ao seu objetivo.", highlight:"Parcelas que cabem no seu bolso" },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', step:"02", title:"Entre no Grupo", desc:"Com apenas a primeira parcela, voce ja faz parte de um grupo de consorciados.", highlight:"Comece a concorrer imediatamente" },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>', step:"03", title:"Seja Contemplado", desc:"Todos os meses ocorrem contemplacoes por sorteio ou lance.", highlight:"Sorteios e lances todo mes" },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.068 5.068 0 1 1-7.07 7.07 5.068 5.068 0 0 1 7.07-7.07m1.42-1.42L19 2m-2 0h4v4"/></svg>', step:"04", title:"Realize seu Sonho", desc:"Com a carta de credito em maos, voce compra a vista com poder de negociacao.", highlight:"Poder de compra a vista" }
];

const trustStats = [
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', value:"+500 mil", label:"Clientes Satisfeitos", desc:"Mais de meio milhao de brasileiros ja realizaram seus sonhos conosco." },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>', value:"50 anos", label:"No Mercado", desc:"Meio seculo de experiencia, solidez e compromisso com voce." },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>', value:"R$ 2 bi+", label:"Em Creditos", desc:"Bilhoes em cartas de credito contempladas para nossos consorciados." },
  { icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>', value:"100%", label:"Regulamentado", desc:"Operamos sob supervisao do Banco Central do Brasil." }
];

const trustReasons = [
  { icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', text:"Atendimento premiado e personalizado" },
  { icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>', text:"Nota 4.9 em satisfacao do cliente" },
  { icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>', text:"Maior indice de contemplacao do mercado" },
  { icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>', text:"Transparencia total em todas as operacoes" }
];

const testimonials = [
  { name:"Carlos Eduardo", role:"Empresario", text:"Fui contemplado em apenas 3 meses! O atendimento do Grupo Ribeiro foi excepcional do inicio ao fim. Recomendo para todos que querem investir com seguranca.", rating:5, product:"consórcio de Automoveis", city:"Goiania, GO" },
  { name:"Maria Fernanda", role:"Professora", text:"Gracas ao Grupo Ribeiro, conquistei minha casa propria sem pagar juros absurdos. As parcelas cabem no meu orcamento e o processo foi todo transparente.", rating:5, product:"consórcio de Imoveis", city:"Rio Verde, GO" },
  { name:"Roberto Silva", role:"Caminhoneiro", text:"Comprei meu caminhao pelo consórcio e expandir minha frota. O Grupo Ribeiro entende as necessidades de quem trabalha pesado. Servico de primeira!", rating:5, product:"Veiculos Pesados", city:"Jatai, GO" },
  { name:"Ana Beatriz", role:"Advogada", text:"Ja e meu terceiro consórcio com o Grupo Ribeiro. A confianca que eles passam e incomparavel. Parcelas justas e contemplacao rapida. Excelente!", rating:5, product:"consórcio de Automoveis", city:"Itumbiara, GO" },
  { name:"Fernando Costa", role:"Medico", text:"Indiquei para toda minha familia e todos ja foram contemplados. O Grupo Ribeiro tem a melhor equipe de consultores que ja encontrei.", rating:5, product:"consórcio de Imoveis", city:"Caldas Novas, GO" },
  { name:"Luciana Mendes", role:"Empreendedora", text:"Comprei minha moto dos sonhos em 6 meses de consórcio. O processo foi super simples, tudo online e com suporte rapido. Super recomendo!", rating:5, product:"consórcio de Motos", city:"Anapolis, GO" },
  { name:"Marcos Aurelio", role:"Agricultor", text:"Renovei toda minha frota de caminhoes com o Grupo Ribeiro. O consórcio de pesados deles e imbativel. 50 anos de mercado nao e a toa.", rating:5, product:"Veiculos Pesados", city:"Catalao, GO" },
  { name:"Juliana Oliveira", role:"Enfermeira", text:"Nunca pensei que conseguiria comprar meu apartamento tao cedo. O Grupo Ribeiro me orientou em cada etapa e fui contemplada em 8 meses.", rating:5, product:"consórcio de Imoveis", city:"Morrinhos, GO" },
  { name:"Paulo Henrique", role:"Engenheiro", text:"A transparencia do Grupo Ribeiro e o que mais me impressiona. Sem surpresas, sem letras miudas. Ja estou no meu segundo consórcio com eles.", rating:5, product:"consórcio de Automoveis", city:"Goiania, GO" },
  { name:"Camila Santos", role:"Dentista", text:"Fiz consórcio de carro e de moto ao mesmo tempo. Ambos com parcelas acessiveis e fui contemplada nos dois em menos de um ano. Incrivel!", rating:5, product:"consórcio de Automoveis", city:"Aparecida de Goiania, GO" }
];

const faqs = [
  { q:"O que e consórcio e como funciona?", a:"O consórcio e uma modalidade de compra programada onde um grupo de pessoas se une para adquirir bens. Cada participante paga parcelas mensais e, a cada mes, um ou mais membros sao contemplados por sorteio ou lance, recebendo a carta de credito para comprar o bem desejado." },
  { q:"consórcio tem juros?", a:"Nao! Essa e a grande vantagem do consórcio. Diferente do financiamento, o consórcio nao cobra juros. Existe apenas uma taxa de administracao, que e muito menor do que os juros cobrados em financiamentos tradicionais." },
  { q:"Quanto tempo leva para ser contemplado?", a:"O tempo de contemplacao varia conforme o grupo. Voce pode ser contemplado ja no primeiro mes por sorteio ou lance. Em media, nossos clientes sao contemplados nos primeiros 12 meses, mas todos sao garantidos ate o final do plano." },
  { q:"Como funciona a contemplacao?", a:"A contemplacao pode acontecer de duas formas: por sorteio, que ocorre mensalmente em assembleia, ou por lance, onde voce oferece um valor para antecipar sua contemplacao. Todos os participantes sao contemplados ate o final do plano." },
  { q:"Posso usar o FGTS no consórcio de imoveis?", a:"Sim! Voce pode utilizar o saldo do FGTS para dar lances, complementar a carta de credito ou amortizar parcelas do consórcio imobiliario, seguindo as regras da Caixa Economica Federal." },
  { q:"O consórcio e seguro?", a:"Absolutamente sim! O consórcio e regulamentado pelo Banco Central do Brasil, que supervisiona todas as administradoras de consórcio. Seu dinheiro esta protegido por lei." }
];



// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initHeroSlider();
  initTicker();
  initCarousel();
  renderBenefits();
  initParallax();
  renderSteps();
  renderTrustStats();
  renderTrustReasons();
  initTestimonials();
  renderFAQ();
  initScrollTop();
  initScrollAnimations();
});

// ========== NAVBAR ==========
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("mobileToggle");
  const menu = document.getElementById("mobileMenu");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  }, { passive: true });
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.innerHTML = open ? "&times;" : "&#9776;";
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    menu.classList.remove("open");
    toggle.innerHTML = "&#9776;";
  }));
}

// ========== HERO SLIDER ==========
function initHeroSlider() {
  let current = 0;
  const bgs = document.querySelectorAll(".hero-bg");
  const headlines = document.querySelectorAll(".hero-headline-item");
  const indicators = document.querySelectorAll(".hero-indicator");
  function goTo(i) {
    bgs.forEach((bg, idx) => bg.classList.toggle("active", idx === i));
    headlines.forEach((h, idx) => h.classList.toggle("active", idx === i));
    indicators.forEach((ind, idx) => ind.classList.toggle("active", idx === i));
    current = i;
  }
  indicators.forEach(ind => ind.addEventListener("click", () => goTo(+ind.dataset.slide)));
  setInterval(() => goTo((current + 1) % 4), 4000);
}

// ========== TICKER ==========
function initTicker() {
  const track = document.getElementById("tickerTrack");
  const allBrands = [...brands, ...brands];
  track.innerHTML = allBrands.map(b => `<div class="ticker-item"><span>${b}</span><span class="ticker-sep">|</span></div>`).join("");
}

// ========== CAROUSEL ==========
function initCarousel() {
  let current = 0, transitioning = false;
  const imgContainer = document.getElementById("carouselImages");
  const contentContainer = document.getElementById("carouselContent");
  const dotsContainer = document.getElementById("carouselDots");
  // Create images
  carouselSlides.forEach((s, i) => {
    const img = document.createElement("img");
    img.src = s.image; img.alt = s.title;
    if (i === 0) img.classList.add("active");
    imgContainer.appendChild(img);
  });
  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "carousel-image-overlay";
  imgContainer.appendChild(overlay);
  // Dots
  carouselSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Slide ${i+1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  function renderContent(i) {
    const s = carouselSlides[i];
    contentContainer.innerHTML = `
      <div style="transition:opacity 0.5s,transform 0.5s">
        <div class="carousel-icon">${s.icon}</div>
        <h3 class="carousel-slide-title font-serif">${s.title}</h3>
        <p class="carousel-slide-desc">${s.desc}</p>
        <div class="carousel-info-grid">
          <div class="carousel-info-card"><div class="carousel-info-label">Credito</div><div class="carousel-info-value">${s.credit}</div></div>
          <div class="carousel-info-card"><div class="carousel-info-label">Parcelas</div><div class="carousel-info-value">${s.parcelas}</div></div>
          <div class="carousel-info-card"><div class="carousel-info-label">Taxa</div><div class="carousel-info-value">${s.taxa}</div></div>
        </div>
        <a href="#contato" class="carousel-cta">Agendar Consultoria</a>
      </div>`;
  }
  function goTo(i) {
    if (transitioning) return;
    transitioning = true;
    imgContainer.querySelectorAll("img").forEach((img, idx) => img.classList.toggle("active", idx === i));
    dotsContainer.querySelectorAll(".carousel-dot").forEach((d, idx) => d.classList.toggle("active", idx === i));
    renderContent(i);
    current = i;
    setTimeout(() => transitioning = false, 600);
  }
  renderContent(0);
  document.getElementById("carouselPrev").addEventListener("click", () => goTo((current - 1 + 4) % 4));
  document.getElementById("carouselNext").addEventListener("click", () => goTo((current + 1) % 4));
  setInterval(() => goTo((current + 1) % 4), 6000);
}

// ========== BENEFITS ==========
function renderBenefits() {
  const grid = document.getElementById("benefitsGrid");
  grid.innerHTML = benefitsData.map((b, i) => `
    <div class="benefit-card hidden-up" style="transition-delay:${i*100}ms">
      <div class="benefit-icon">${b.icon}</div>
      <h3 class="benefit-title">${b.title}</h3>
      <p class="benefit-desc">${b.desc}</p>
    </div>`).join("");
}

// ========== PARALLAX ==========
function initParallax() {
  const section = document.getElementById("parallaxSection");
  const bg = document.getElementById("parallaxBg");
  window.addEventListener("scroll", () => {
    const rect = section.getBoundingClientRect();
    const scrollPercent = rect.top / window.innerHeight;
    bg.style.transform = `translateY(${scrollPercent * 80}px) scale(1.1)`;
  }, { passive: true });
}

// ========== STEPS ==========
function renderSteps() {
  const grid = document.getElementById("stepsGrid");
  grid.innerHTML = stepsData.map((s, i) => `
    <div class="hidden-up" style="transition-delay:${i*150}ms;position:relative">
      ${i < 3 ? '<div class="step-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></div>' : ''}
      <div class="step-card">
        <span class="step-watermark">${s.step}</span>
        <div class="step-icon">${s.icon}</div>
        <div class="step-label">Passo ${s.step}</div>
        <h3 class="step-title">${s.title}</h3>
        <p class="step-desc">${s.desc}</p>
        <div class="step-highlight"><span class="step-highlight-dot"></span>${s.highlight}</div>
      </div>
    </div>`).join("");
}

// ========== TRUST ==========
function renderTrustStats() {
  const grid = document.getElementById("trustStatsGrid");
  grid.innerHTML = trustStats.map((s, i) => `
    <div class="trust-stat-card hidden-up" style="transition-delay:${i*120}ms">
      <div class="trust-stat-icon">${s.icon}</div>
      <div class="trust-stat-value font-serif">${s.value}</div>
      <div class="trust-stat-label">${s.label}</div>
      <p class="trust-stat-desc">${s.desc}</p>
    </div>`).join("");
}
function renderTrustReasons() {
  const grid = document.getElementById("trustReasonsGrid");
  grid.innerHTML = trustReasons.map(r => `
    <div class="trust-reason">
      <div class="trust-reason-icon">${r.icon}</div>
      <span>${r.text}</span>
    </div>`).join("");
}

// ========== TESTIMONIALS ==========
function initTestimonials() {
  const grid = document.getElementById("testimonialsGrid");
  const pagination = document.getElementById("testimonialPagination");
  const statsContainer = document.getElementById("testimonialsStats");
  const perPage = 3;
  let currentPage = 0;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const starSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  function render(page) {
    currentPage = page;
    const start = page * perPage;
    const visible = testimonials.slice(start, start + perPage);
    grid.innerHTML = visible.map((t,i) => `
      <div class="testimonial-card" style="animation-delay:${i*100}ms">
        <svg class="testimonial-quote-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        <div class="testimonial-stars">${Array(t.rating).fill(starSvg).join("")}</div>
        <div class="testimonial-product">${t.product}</div>
        <p class="testimonial-text">&ldquo;${t.text}&rdquo;</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.name.charAt(0)}</div>
          <div><div class="testimonial-name">${t.name}</div><div class="testimonial-role">${t.role} &mdash; ${t.city}</div></div>
        </div>
      </div>`).join("");
    // Pagination dots
    let dotsHtml = `<button class="testimonial-pagination-btn" id="testPrev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button><div class="testimonial-dots">`;
    for (let i = 0; i < totalPages; i++) {
      dotsHtml += `<button class="testimonial-dot${i===page?" active":""}" data-page="${i}" aria-label="Pagina ${i+1}"></button>`;
    }
    dotsHtml += `</div><button class="testimonial-pagination-btn" id="testNext"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>`;
    pagination.innerHTML = dotsHtml;
    pagination.querySelectorAll(".testimonial-dot").forEach(d => d.addEventListener("click", () => render(+d.dataset.page)));
    document.getElementById("testPrev").addEventListener("click", () => render((currentPage - 1 + totalPages) % totalPages));
    document.getElementById("testNext").addEventListener("click", () => render((currentPage + 1) % totalPages));
  }
  render(0);
  setInterval(() => render((currentPage + 1) % totalPages), 8000);
  // Stats
  const stats = [{ v:"4.9/5", l:"Avaliacao media" },{ v:"500k+", l:"Clientes satisfeitos" },{ v:"98%", l:"Recomendam" },{ v:"50+", l:"Anos de mercado" }];
  statsContainer.innerHTML = stats.map(s => `<div class="testimonials-stat"><div class="testimonials-stat-value">${s.v}</div><div class="testimonials-stat-label">${s.l}</div></div>`).join("");
}

// ========== FAQ ==========
function renderFAQ() {
  const list = document.getElementById("faqList");
  list.innerHTML = faqs.map((f, i) => `
    <div class="faq-item hidden-up${i===0?" open":""}" style="transition-delay:${i*80}ms">
      <button class="faq-question" type="button">
        <span>${f.q}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="faq-answer"><p>${f.a}</p></div>
    </div>`).join("");
  list.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      list.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}



// ========== SCROLL TOP ==========
function initScrollTop() {
  const btn = document.getElementById("scrollTop");
  window.addEventListener("scroll", () => btn.classList.toggle("visible", window.scrollY > 500), { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll(".hidden-up, .hidden-left, .hidden-right, .hidden-scale").forEach(el => observer.observe(el));
}


