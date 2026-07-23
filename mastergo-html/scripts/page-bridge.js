(function () {
  const rankingRoutes = {
    综合: "ranking",
    经营: "ranking-business",
    运营: "ranking-operation",
    内控: "ranking-internal",
    舆情: "ranking-reputation",
    创新: "ranking-innovation",
    安全: "ranking-safety"
  };
  const pageRoutes = { 总览: "overview", 排行: "ranking", 督办: "supervision" };
  const indicators = ["经营板块", "运营板块", "内控板块", "舆情板块", "创新板块", "安全板块"];
  const send = payload => window.parent.postMessage({ source: "mastergo-prototype", ...payload }, "*");
  const compact = value => String(value || "").replace(/\s+/g, "").trim();
  const textOf = node => compact(node?.textContent);

  function supervisionTab(label, node) {
    const frames = [...document.querySelectorAll('[data-name^="Frame 212"]')];
    frames.forEach(frame => {
      const active = textOf(frame).includes(label);
      frame.style.borderBottom = active ? "2.56px solid #477AFC" : "0";
      const span = frame.querySelector("span");
      if (span) span.style.color = active ? "#101A3E" : "#8D90A6";
    });
    const listCards = [...document.querySelectorAll('[data-name="Button"]')]
      .filter(card => card.getBoundingClientRect().top > 300 && textOf(card).length > 20);
    listCards.forEach((card, index) => {
      const completed = label.includes("办结");
      card.style.display = completed ? (index < 2 ? "flex" : "none") : "flex";
      [...card.querySelectorAll("span")].filter(span => ["进行中", "已办结"].includes(textOf(span))).forEach(span => {
        span.textContent = completed ? "已办结" : "进行中";
        span.style.color = completed ? "#1f9d62" : "#477AFC";
      });
    });
    send({ action: "open-control", control: "supervision-tab", label });
  }

  document.addEventListener("click", event => {
    let node = event.target;
    for (let depth = 0; node && depth < 10; depth += 1, node = node.parentElement) {
      const name = node.getAttribute?.("data-name") || "";
      const text = textOf(node);
      const pageLabel = Object.keys(pageRoutes).find(label => text === label || (text.endsWith(label) && text.length <= 6));
      if (pageLabel) {
        event.preventDefault();
        send({ action: "navigate", route: pageRoutes[pageLabel] });
        return;
      }
      if (rankingRoutes[text]) {
        event.preventDefault();
        send({ action: "navigate", route: rankingRoutes[text] });
        return;
      }
      const indicator = indicators.find(item => text.includes(item) && text.length < 160);
      if (indicator) {
        event.preventDefault();
        send({ action: "open-indicator", indicator: indicator.replace("板块", "") });
        return;
      }
      if (name === "切换对象" || text === "切换范围") {
        event.preventDefault();
        send({ action: "open-control", control: "scope" });
        return;
      }
      if (name.includes("打开个人侧边栏") || name.includes("菜单")) {
        event.preventDefault();
        send({ action: "open-control", control: "menu" });
        return;
      }
      if (name === "搜索" || text === "搜索") {
        event.preventDefault();
        send({ action: "open-control", control: "search" });
        return;
      }
      if (text.includes("点击查看更多数据")) {
        event.preventDefault();
        send({ action: "open-control", control: "all-indicators" });
        return;
      }
      if (name === "更多" || text === "更多") {
        event.preventDefault();
        send({ action: "open-control", control: "feed" });
        return;
      }
      if (name === "项目预警" || name === "项目问题" || name === "其中:未解决问题") {
        event.preventDefault();
        supervisionTab(text, node);
        return;
      }
      if (name === "info-circle" || name === "进度说明") {
        event.preventDefault();
        send({ action: "open-control", control: "info", title: text || "指标说明", description: "该指标按照正式指标表的定义、权重、评分标准和红线规则计算，当前页面展示仿真值。" });
        return;
      }
      if (name === "Button" && text.length > 20 && !text.includes("企业经营六大指标")) {
        event.preventDefault();
        send({ action: "open-control", control: "detail", title: text.slice(0, 28), description: "已打开事项详情。该条目支持查看责任区域、更新时间、进度和后续跟进记录。" });
        return;
      }
    }
  }, true);
})();
