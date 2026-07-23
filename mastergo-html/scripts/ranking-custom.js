(function () {
  const script = document.currentScript;
  const mode = script.dataset.mode;
  const data = window.PROTOTYPE_DATA.rankings[mode];
  if (!data) return;

  function colorFor(value, index) {
    if (index < 3) return "#25c96f";
    if (index === 3) return "#f4a51c";
    return "#f2485b";
  }

  function setActiveTab() {
    ["综合", "经营", "运营", "内控", "舆情", "创新", "安全"].forEach(label => {
      const span = [...document.querySelectorAll("span")].find(item => item.textContent.trim() === label);
      if (!span || !span.parentElement) return;
      const parent = span.parentElement;
      parent.style.background = "transparent";
      parent.style.border = "0";
      parent.style.borderImage = "none";
      span.style.color = "#8D90A6";
      if (label === data.tab) {
        parent.style.background = "rgba(61,111,232,0.05)";
        parent.style.borderBottom = "2.56px solid #477AFC";
        span.style.color = "#101A3E";
      }
    });
  }

  function render() {
    const reason = document.querySelector('[data-node-id="2:3494"]');
    if (!reason) return;
    reason.style.padding = "16px 12px";
    reason.style.gap = "12px";
    reason.style.overflow = "visible";
    reason.innerHTML = `
      <div class="custom-ranking" style="--custom-accent:${data.accent}">
        <div class="custom-section-head">
          <div class="custom-section-title">${data.title}</div>
          <div class="custom-section-note">六大维度加权综合得分排名</div>
        </div>
        <section class="custom-card">
          <div class="custom-card-main">
            <div class="custom-card-title"><span>${data.cardTitle}</span><span class="custom-pill">本年度累计</span></div>
            <div class="custom-segments">${data.segments.map((item, index) => `<span class="${index === 0 ? "active" : ""}">${item}</span>`).join("")}</div>
            <div class="custom-insight"><b>经营分析：</b>${data.insight}</div>
            <div class="custom-chart">${data.values.map((value, index) => `
              <div class="custom-bar-wrap">
                <div class="custom-bar" style="height:${Math.max(24, value - 20)}px;--bar-color:${colorFor(value, index)}"></div>
                <span class="custom-bar-label">${data.names[index].replace("区", "")}</span>
              </div>`).join("")}
            </div>
          </div>
          <div class="custom-ranks">${data.values.map((value, index) => {
            const color = colorFor(value, index);
            return `<div class="custom-rank" style="--row-color:${color}">
              <span class="custom-rank-index">${index + 1}</span>
              <span class="custom-rank-name">${data.names[index]}</span>
              <span class="custom-rank-value">${value}%</span>
              <span class="custom-progress"><i style="width:${value}%"></i></span>
            </div>`;
          }).join("")}</div>
        </section>
        <section class="custom-card custom-secondary">
          <h3>关键指标概览</h3>
          <div class="custom-secondary-grid">${data.secondary.map((label, index) => `
            <div class="custom-stat"><span>${label}</span><strong>${data.stats[index]}</strong><em>${data.trends[index]}</em></div>
          `).join("")}</div>
        </section>
      </div>`;
    setActiveTab();
    document.title = `企业经营管理驾驶舱 · ${data.tab}排行`;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
