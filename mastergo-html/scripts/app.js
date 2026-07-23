(function () {
  const frame = document.getElementById("page-frame");
  const modal = document.getElementById("indicator-modal");
  const modalContent = document.getElementById("indicator-content");
  const modalTitle = document.getElementById("indicator-title");
  const routeButtons = [...document.querySelectorAll("[data-route]")];
  const rankingButtons = [...document.querySelectorAll("[data-ranking]")];
  const files = {
    overview: "overview.html",
    ranking: "ranking.html",
    "ranking-business": "ranking-business.html",
    "ranking-operation": "ranking-operation.html",
    "ranking-internal": "ranking-internal.html",
    "ranking-reputation": "ranking-reputation.html",
    "ranking-innovation": "ranking-innovation.html",
    "ranking-safety": "ranking-safety.html",
    supervision: "supervision.html"
  };
  let currentRoute = "overview";

  function navigate(route) {
    if (!files[route]) return;
    currentRoute = route;
    frame.src = `./${files[route]}`;
    closeModal();
    const mainRoute = route.startsWith("ranking") ? "ranking" : route;
    routeButtons.forEach(button => button.classList.toggle("is-active", button.dataset.route === mainRoute));
    rankingButtons.forEach(button => button.classList.toggle("is-active", button.dataset.ranking === route));
  }

  function openIndicator(name) {
    const data = window.PROTOTYPE_DATA.indicators[name] || window.PROTOTYPE_DATA.indicators.经营;
    modalTitle.textContent = "指标健康情况";
    modalContent.innerHTML = `
      <div class="indicator-summary">
        <div class="summary-line"><span>当前综合分</span><strong class="summary-score">${data.score}<small> 分</small></strong></div>
        <div class="summary-track"><i style="width:${data.score}%"></i></div>
        <div class="metric-foot"><span>年度指标健康度</span><span>${data.score >= 95 ? "健康" : "需关注"}</span></div>
      </div>
      <div class="scope-field"><label>按公司分类</label><div><span>${data.company}</span><span>⌄</span></div></div>
      <div class="metric-list">${data.metrics.map(metric => `
        <article class="metric-item">
          <div class="metric-head"><span class="metric-name">${metric[0]}</span><strong class="metric-value">${metric[1]}%</strong></div>
          <p class="metric-copy">${metric[2]}</p>
          <div class="metric-track"><i style="width:${metric[1]}%"></i></div>
          <div class="metric-foot"><span>年度累计统计</span><span>${metric[1] >= 95 ? "已达标" : "持续推进"}</span></div>
        </article>`).join("")}</div>`;
    modal.hidden = false;
  }

  function closeModal() { modal.hidden = true; }

  routeButtons.forEach(button => button.addEventListener("click", () => navigate(button.dataset.route)));
  rankingButtons.forEach(button => button.addEventListener("click", () => navigate(button.dataset.ranking)));
  document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
  window.addEventListener("message", event => {
    const message = event.data;
    if (!message || message.source !== "mastergo-prototype") return;
    if (message.action === "navigate") navigate(message.route);
    if (message.action === "open-indicator") openIndicator(message.indicator);
  });

  rankingButtons[0]?.classList.add("is-active");
  window.prototypeApp = { navigate, openIndicator, getCurrentRoute: () => currentRoute };
})();
