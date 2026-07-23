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

  document.addEventListener("click", event => {
    let node = event.target;
    for (let depth = 0; node && depth < 7; depth += 1, node = node.parentElement) {
      const text = compact(node.textContent);
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
      const indicator = indicators.find(name => text.includes(name) && text.length < 120);
      if (indicator) {
        event.preventDefault();
        send({ action: "open-indicator", indicator: indicator.replace("板块", "") });
        return;
      }
    }
  }, true);
})();
