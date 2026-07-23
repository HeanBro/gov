(function () {
  const script = document.currentScript;
  const mode = script.dataset.mode;
  const data = window.PROTOTYPE_DATA.rankings[mode];
  if (!data) return;
  const state = { segment: 0, period: 2 };
  const periods = ["月度", "季度", "年度"];

  function colorFor(value, index) {
    if (index < 3) return "#25c96f";
    if (index === 3) return "#f4a51c";
    return "#f2485b";
  }

  function currentValues() {
    const segmentOffset = [0, -2.4, -5.6][state.segment] || 0;
    const periodOffset = [-3.1, -1.2, 0][state.period] || 0;
    return data.values.map((value, index) => Math.max(62, Math.min(100, Number((value + segmentOffset + periodOffset - index * state.segment * 0.35).toFixed(1)))));
  }

  function formatInsight(text) {
    const valueMatch = String(text).match(/\d+(?:\.\d+)?%/);
    if (!valueMatch || valueMatch.index === undefined) return `<span>${text}</span>`;
    const start = valueMatch.index;
    const end = start + valueMatch[0].length;
    return `<span>${text.slice(0, start)}</span><span class="custom-insight-value">${valueMatch[0]}</span><span>${text.slice(end)}</span>`;
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
            <div class="custom-card-title"><span>${data.cardTitle}</span><div class="custom-periods">${periods.map((item, index) => `<button type="button" class="${index === state.period ? "active" : ""}" data-period-index="${index}">${item}</button>`).join("")}</div></div>
            <div class="custom-segments">${data.segments.map((item, index) => `<button type="button" class="${index === 0 ? "active" : ""}" data-segment-index="${index}">${item}</button>`).join("")}</div>
            <div class="custom-insight"><p>${formatInsight(`&#128202; ${data.insight}`)}</p></div>
            <div class="custom-chart">${currentValues().map((value, index) => `
              <div class="custom-bar-wrap">
                <div class="custom-bar-value" data-custom-bar-value="${index}">${value}%</div>
                <div class="custom-bar" data-custom-bar="${index}" style="height:${Math.max(24, value - 20)}px;--bar-color:${colorFor(value, index)}"></div>
                <span class="custom-bar-label">${data.names[index].replace("区", "")}</span>
              </div>`).join("")}
            </div>
          </div>
          <div class="custom-ranks">${currentValues().map((value, index) => {
            const color = colorFor(value, index);
            return `<div class="custom-rank" style="--row-color:${color}">
              <span class="custom-rank-index">${index + 1}</span>
              <i class="custom-rank-dot" aria-hidden="true"></i>
              <span class="custom-rank-name">${data.names[index]}</span>
              <span class="custom-rank-value" data-custom-rank-value="${index}">${value}%</span>
              <span class="custom-progress"><i data-custom-progress="${index}" style="width:${value}%"></i></span>
            </div>`;
          }).join("")}</div>
        </section>
        <section class="custom-card custom-secondary">
          <h3>关键指标概览</h3>
          <div class="custom-secondary-grid">${data.secondary.map((label, index) => `
            <button type="button" class="custom-stat"><span>${label}</span><strong>${data.stats[index]}</strong><em>${data.trends[index]}</em></button>
          `).join("")}</div>
        </section>
      </div>`;
    setActiveTab();
    document.title = `企业经营管理驾驶舱 · ${data.tab}排行`;
    rootInteractive();
  }

  function rootInteractive() {
    const root = document.querySelector(".custom-ranking");
    if (!root) return;
    root.querySelectorAll("[data-segment-index]").forEach(button => button.addEventListener("click", () => {
      state.segment = Number(button.dataset.segmentIndex);
      updateDisplay(root);
    }));
    root.querySelectorAll("[data-period-index]").forEach(button => button.addEventListener("click", () => {
      state.period = Number(button.dataset.periodIndex);
      updateDisplay(root);
    }));
    root.querySelectorAll(".custom-rank, .custom-stat").forEach(item => item.addEventListener("click", () => {
      window.parent.postMessage({ source: "mastergo-prototype", action: "open-control", control: "detail", title: item.textContent.trim().replace(/\s+/g, " ").slice(0, 34), description: "已打开该排行条目的区域详情，支持查看指标趋势、责任单位和异常记录。" }, "*");
    }));
  }

  function updateDisplay(root) {
    const values = currentValues();
    root.querySelectorAll("[data-segment-index]").forEach(button => button.classList.toggle("active", Number(button.dataset.segmentIndex) === state.segment));
    root.querySelectorAll("[data-period-index]").forEach(button => button.classList.toggle("active", Number(button.dataset.periodIndex) === state.period));
    const insight = root.querySelector(".custom-insight");
    if (insight) insight.innerHTML = `<p>${formatInsight(`&#128202; ${data.insight} · 当前查看${periods[state.period]}${data.segments[state.segment]}口径`)}</p>`;
    values.forEach((value, index) => {
      const bar = root.querySelector(`[data-custom-bar="${index}"]`);
      const barValue = root.querySelector(`[data-custom-bar-value="${index}"]`);
      const rankValue = root.querySelector(`[data-custom-rank-value="${index}"]`);
      const progress = root.querySelector(`[data-custom-progress="${index}"]`);
      if (bar) bar.style.height = `${Math.max(24, value - 20)}px`;
      if (barValue) barValue.textContent = `${value}%`;
      if (rankValue) rankValue.textContent = `${value}%`;
      if (progress) progress.style.width = `${value}%`;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
