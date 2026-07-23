(function () {
  const stack = document.getElementById("page-stack");
  const modal = document.getElementById("indicator-modal");
  const modalContent = document.getElementById("indicator-content");
  const modalTitle = document.getElementById("indicator-title");
  const sheet = document.getElementById("action-sheet");
  const sheetTitle = document.getElementById("sheet-title");
  const sheetEyebrow = document.getElementById("sheet-eyebrow");
  const sheetContent = document.getElementById("sheet-content");
  const toast = document.getElementById("prototype-toast");
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
  const initialFrame = document.getElementById("page-frame");
  initialFrame.dataset.loaded = "false";
  const frames = new Map([["overview", initialFrame]]);
  let currentRoute = "overview";
  let requestedRoute = "overview";
  let selectedScope = "大湾区区域公司";
  let activeIndicatorName = "经营";
  let toastTimer;
  let searchTimer;

  const escapeHtml = value => String(value ?? "").replace(/[&<>\"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));

  function markFrameReady(frame, route) {
    if (frame.classList.contains("is-ready")) return;
    frame.dataset.loaded = "true";
    applyScope(frame);
    requestAnimationFrame(() => frame.classList.add("is-ready"));
    if (frame.dataset.pendingRoute === "true" && requestedRoute === route) {
      frame.dataset.pendingRoute = "false";
      activateFrame(route);
    }
  }

  initialFrame.addEventListener("load", () => markFrameReady(initialFrame, "overview"));
  if (initialFrame.contentDocument?.readyState === "complete") markFrameReady(initialFrame, "overview");

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 1900);
  }

  function ensureFrame(route) {
    if (!files[route]) return null;
    if (frames.has(route)) return frames.get(route);
    const frame = document.createElement("iframe");
    frame.className = "route-frame";
    frame.dataset.routeFrame = route;
    frame.title = `企业经营管理驾驶舱${route.startsWith("ranking") ? "排行" : route === "supervision" ? "督办" : "总览"}`;
    frame.src = `./${files[route]}`;
    frame.addEventListener("load", () => markFrameReady(frame, route));
    stack.appendChild(frame);
    frames.set(route, frame);
    return frame;
  }

  function applyScope(frame) {
    try {
      const company = frame.contentDocument?.querySelector('[data-name="天健城市服务有限公司"]');
      if (company) company.textContent = selectedScope;
    } catch (error) {
      // All prototype frames are same-origin; this guard keeps navigation safe
      // if the files are opened from a different host during handoff.
    }
  }

  function activateFrame(route) {
    const next = frames.get(route);
    if (!next) return;
    const previous = frames.get(currentRoute);
    next.classList.add("is-active");
    next.setAttribute("aria-hidden", "false");
    if (previous && previous !== next) {
      previous.classList.remove("is-active");
      previous.setAttribute("aria-hidden", "true");
    }
    currentRoute = route;
    requestedRoute = route;
  }

  function navigate(route) {
    if (!files[route] || route === currentRoute || route === requestedRoute) return;
    requestedRoute = route;
    closeModal();
    closeSheet();
    const frame = ensureFrame(route);
    if (frame.dataset.loaded === "true") {
      activateFrame(route);
      return;
    }
    frame.dataset.pendingRoute = "true";
    showToast("正在打开页面…");
  }

  function openIndicator(name) {
    const data = window.PROTOTYPE_DATA?.indicators?.[name] || window.PROTOTYPE_DATA?.indicators?.经营;
    if (!data) return;
    activeIndicatorName = name;
    modalTitle.textContent = "指标健康情况";
    const healthy = data.metrics.filter(metric => metric.value >= 90).length;
    const segmentCount = data.metrics.length;
    const activeSegments = healthy;
    modalContent.innerHTML = `
      <div class="indicator-summary">
        <div class="summary-line"><span>当前综合分</span><strong class="summary-score">${data.score}</strong></div>
        <div class="summary-track">${Array.from({ length: segmentCount }, (_, index) => `<i class="${index < activeSegments ? "is-filled" : ""}"></i>`).join("")}</div>
        <div class="summary-meta">年度指标 ${data.metrics.length} 项 / 已达标 ${healthy} 项</div>
      </div>
      <div class="scope-field"><label>按公司分类</label><button type="button" data-modal-scope><span class="scope-dot"></span><span>${escapeHtml(selectedScope)}</span><span class="scope-chevron" aria-hidden="true"></span></button></div>
      <div class="metric-list">${data.metrics.map(metric => `
        <details class="metric-item">
          <summary>
            <div class="metric-head"><span class="metric-name">${escapeHtml(metric.name)}</span><span class="metric-weight">权重 ${metric.weight}%</span><strong class="metric-value">${metric.value}<small>%</small></strong></div>
            <p class="metric-copy">指标权重 ${metric.weight}% · 数据来源：${escapeHtml(metric.source)}</p>
            <div class="metric-track"><i style="width:${metric.value}%"></i></div>
            <div class="metric-foot"><span>口径：${escapeHtml(metric.calculation)}</span><span>${metric.value >= 90 ? "达标" : "持续推进"}</span></div>
          </summary>
          <div class="metric-detail-grid">
            <div class="metric-detail-row"><b>指标定义</b><span>${escapeHtml(metric.definition)}</span></div>
            <div class="metric-detail-row"><b>计算口径</b><span>${escapeHtml(metric.calculation)}</span></div>
            <div class="metric-detail-row"><b>评分标准</b><span>${escapeHtml(metric.standard)}</span></div>
            <div class="metric-detail-row"><b>红线规则</b><span>${escapeHtml(metric.redline)}</span></div>
            <div class="metric-detail-row"><b>项目层穿透</b><span>${escapeHtml(metric.project)}</span></div>
            <div class="metric-detail-row"><b>区域层穿透</b><span>${escapeHtml(metric.region)}</span></div>
            <div class="metric-detail-row"><b>本部层穿透</b><span>${escapeHtml(metric.hq)}</span></div>
            <div class="metric-detail-row"><b>数据说明</b><span>指标定义来自正式说明表；当前分值为交互原型仿真值。${data.weightTotal !== 100 ? `${name}板块原表权重合计 ${data.weightTotal}%，已保留原始权重。` : ""}</span></div>
          </div>
        </details>`).join("")}</div>`;
    modal.hidden = false;
  }

  function closeModal() { modal.hidden = true; }
  function closeSheet() { sheet.hidden = true; sheetContent.innerHTML = ""; sheet.dataset.returnIndicator = ""; }

  function openSheet(type, payload = {}) {
    closeModal();
    sheet.hidden = false;
    if (type === "scope") {
      sheetEyebrow.textContent = "统计范围";
      sheetTitle.textContent = "切换查看范围";
      const options = ["集团总部", "大湾区区域公司", "华东区域公司", "华南区域公司"];
      sheetContent.innerHTML = `<div class="sheet-list">${options.map(item => `<button class="sheet-option ${item === selectedScope ? "is-selected" : ""}" type="button" data-scope-option="${escapeHtml(item)}"><span>${item}</span><span>${item === selectedScope ? "✓" : ""}</span></button>`).join("")}</div>`;
    } else if (type === "menu") {
      sheetEyebrow.textContent = "工作台设置";
      sheetTitle.textContent = "个人快捷操作";
      sheetContent.innerHTML = `<div class="sheet-list"><button class="menu-action" type="button" data-menu-action="profile"><span>个人信息与权限</span><span>›</span></button><button class="menu-action" type="button" data-menu-action="notice"><span>消息通知设置</span><span>›</span></button><button class="menu-action" type="button" data-menu-action="refresh"><span>刷新全部驾驶舱数据</span><span>›</span></button><button class="menu-action" type="button" data-menu-action="about"><span>关于企业经营管理驾驶舱</span><span>›</span></button></div>`;
    } else if (type === "feed") {
      sheetEyebrow.textContent = "动态中心";
      sheetTitle.textContent = "最近更新动态";
      const items = [
        ["2026-07-21", "华中区域公司督办事项更新", "4 项事项新增跟进记录", "已更新"],
        ["2026-07-20", "安全隐患闭环数据同步", "西南区域新增 12 条闭环记录", "已同步"],
        ["2026-07-18", "经营指标口径完成校准", "收入、利润与现金流指标已校准", "已完成"],
        ["2026-07-16", "客户满意度月度数据更新", "本月有效样本 2,184 份", "已更新"]
      ];
      sheetContent.innerHTML = `<div class="sheet-list">${items.map(item => `<article class="sheet-card"><h3>${item[1]} <span class="status-pill">${item[3]}</span></h3><p>${item[2]}</p><footer><span>${item[0]}</span><span>查看记录 ›</span></footer></article>`).join("")}</div>`;
    } else if (type === "search") {
      sheetEyebrow.textContent = "全局检索";
      sheetTitle.textContent = "搜索督办与经营事项";
      sheetContent.innerHTML = `<label class="sheet-search"><span>⌕</span><input id="global-search-input" type="search" placeholder="输入标题、区域或指标" autofocus /></label><p id="search-result-count" class="search-result-count">输入关键词查看匹配结果</p><div id="search-results" class="sheet-list"></div>`;
      const input = document.getElementById("global-search-input");
      input.addEventListener("input", () => renderSearchResults(input.value));
      input.focus();
    } else if (type === "supervision-tab") {
      sheetEyebrow.textContent = "督办事项";
      sheetTitle.textContent = payload.label || "事项详情";
      sheetContent.innerHTML = `<div class="sheet-list"><article class="sheet-card"><h3>${payload.label || "当前事项列表"}</h3><p>已按当前状态筛选事项。页面列表同步展示 ${payload.label === "办结事项（含持续更新）" ? "已完成及持续跟踪" : "推进中"} 的重点任务。</p><footer><span>数据更新时间 2026-07-23 09:30</span><span class="status-pill">已同步</span></footer></article></div>`;
    } else if (type === "all-indicators") {
      sheetEyebrow.textContent = "六大领域";
      sheetTitle.textContent = "全部正式指标";
      const indicators = window.PROTOTYPE_DATA?.indicators || {};
      sheetContent.innerHTML = `<div class="sheet-list">${Object.entries(indicators).map(([name, item]) => `<button type="button" class="sheet-option" data-open-indicator="${name}"><span><b>${name}板块</b><small style="display:block;color:#8a96aa;margin-top:3px;font-size:9px">${item.metrics.length} 项正式指标 · 权重合计 ${item.weightTotal}%</small></span><span class="status-pill ${item.score < 90 ? "warn" : ""}">${item.score} 分</span></button>`).join("")}</div>`;
    } else {
      sheetEyebrow.textContent = payload.eyebrow || "事项详情";
      sheetTitle.textContent = payload.title || "查看详情";
      sheetContent.innerHTML = `<article class="sheet-card"><h3>${payload.title || "事项详情"}</h3><p>${payload.description || "已打开该模块的仿真详情。你可以继续使用页面中的筛选、切换和查看动作。"}</p><footer><span>数据更新时间 2026-07-23 09:30</span><span class="status-pill">可跟进</span></footer></article>`;
    }
  }

  function renderSearchResults(keyword) {
    const result = document.getElementById("search-results");
    const count = document.getElementById("search-result-count");
    if (!result || !count) return;
    const query = keyword.trim();
    const records = [
      ["华中区域公司督办事项更新", "督办 · 华中区域", "推进中"],
      ["营业总收入指标完成度", "经营 · 财务系统", "98 分"],
      ["年度审计问题整改率", "内控 · 审计台账", "99 分"],
      ["客户满意度月度回访", "运营 · 客服系统", "97 分"],
      ["网络安全事故监测", "安全 · 运维平台", "零事故"]
    ];
    const matches = query ? records.filter(item => item.join(" ").includes(query)) : records;
    count.textContent = query ? `找到 ${matches.length} 条匹配结果` : "最近访问与重点数据";
    result.innerHTML = matches.map(item => `<button type="button" class="sheet-option" data-search-result="${escapeHtml(item[0])}"><span><b>${escapeHtml(item[0])}</b><small style="display:block;color:#8a96aa;margin-top:3px;font-size:9px">${escapeHtml(item[1])}</small></span><span class="status-pill">${escapeHtml(item[2])}</span></button>`).join("");
  }

  document.addEventListener("click", event => {
    const target = event.target.closest("[data-close-modal], [data-close-sheet], [data-scope-option], [data-menu-action], [data-search-result], [data-open-indicator], [data-modal-scope]");
    if (!target) return;
    if (target.dataset.closeModal !== undefined) closeModal();
    if (target.dataset.closeSheet !== undefined) closeSheet();
    if (target.dataset.modalScope !== undefined) {
      const returnIndicator = activeIndicatorName;
      openSheet("scope");
      sheet.dataset.returnIndicator = returnIndicator;
    }
    if (target.dataset.scopeOption) {
      const returnIndicator = sheet.dataset.returnIndicator;
      selectedScope = target.dataset.scopeOption;
      frames.forEach(frame => applyScope(frame));
      showToast(`已切换至${selectedScope}`);
      closeSheet();
      if (returnIndicator) openIndicator(returnIndicator);
    }
    if (target.dataset.menuAction) { showToast({ profile: "个人信息已打开", notice: "通知设置已打开", refresh: "数据刷新任务已提交", about: "当前为企业经营管理驾驶舱交互原型" }[target.dataset.menuAction]); }
    if (target.dataset.searchResult) { showToast(`已定位：${target.dataset.searchResult}`); closeSheet(); }
    if (target.dataset.openIndicator) { const name = target.dataset.openIndicator; closeSheet(); openIndicator(name); }
  });

  document.addEventListener("keydown", event => { if (event.key === "Escape") { closeModal(); closeSheet(); } });
  window.addEventListener("message", event => {
    const message = event.data;
    if (!message || message.source !== "mastergo-prototype") return;
    if (message.action === "navigate") navigate(message.route);
    if (message.action === "open-indicator") openIndicator(message.indicator);
    if (message.action === "open-control") openSheet(message.control, message);
    if (message.action === "show-toast") showToast(message.text);
  });

  window.prototypeApp = { navigate, openIndicator, openSheet, getCurrentRoute: () => currentRoute };
  // Warm the most-used routes without changing the visible page. Any route
  // that is still loading keeps the current frame visible until it is ready.
  ["ranking", "supervision"].forEach(route => ensureFrame(route));
})();
