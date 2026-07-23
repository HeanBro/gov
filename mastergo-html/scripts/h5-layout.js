(function () {
  function applyH5Layout() {
    const root = document.querySelector('[data-name="Screen3"]');
    if (!root) return;

    document.documentElement.style.width = "100%";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.width = "100%";
    document.body.style.margin = "0";
    document.body.style.background = "#E8EEFF";
    document.body.style.paddingBottom = "56px";
    document.body.style.overflowX = "hidden";

    if (!document.getElementById("h5-scrollbar-style")) {
      const style = document.createElement("style");
      style.id = "h5-scrollbar-style";
      style.textContent = "html,body{scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0}";
      document.head.appendChild(style);
    }

    root.style.width = "100%";
    root.style.maxWidth = "750px";
    root.style.height = "auto";
    root.style.minHeight = "100vh";
    root.style.margin = "0 auto";
    root.style.overflow = "visible";
    root.style.overflowX = "hidden";

    const directChildren = [...root.children];
    const simulatedHeader = directChildren.find(node => node.dataset.name === "头部信息");
    if (simulatedHeader) simulatedHeader.style.display = "none";

    const content = directChildren.find(node => node.style.top === "88px");
    if (content) {
      content.style.width = "100%";
      content.style.height = "auto";
      content.style.minHeight = "calc(100vh - 56px)";
      content.style.position = "relative";
      content.style.left = "0";
      content.style.top = "0";
      content.style.overflow = "visible";

      // The exported canvas contains a second, simulated phone header. The
      // first Reason block inside the real content is the H5 header we keep.
      const pageHeader = content.querySelector('[data-name="Reason"]');
      if (pageHeader) pageHeader.dataset.h5Header = "true";

      const contentInner = content.querySelector(':scope > [data-name="content"]') || content.firstElementChild;
      if (contentInner) {
        contentInner.dataset.h5ContentInner = "true";
        contentInner.style.width = "100%";
        contentInner.style.maxWidth = "100%";
        contentInner.style.minWidth = "0";
        contentInner.style.boxSizing = "border-box";
        [...contentInner.children].forEach(section => {
          section.style.width = "100%";
          section.style.maxWidth = "100%";
          section.style.minWidth = "0";
          section.style.boxSizing = "border-box";
        });
      }
      const managedPage = /排行|督办/.test(document.title);
      if (!managedPage && pageHeader && contentInner) {
        pageHeader.dataset.h5OverviewHeader = "true";
        contentInner.style.paddingTop = "48px";
      }

      if (contentInner) {
        const fullWidthSeeds = new Set(["375px", "366px", "364px", "356px", "351px", "343px", "341px", "340px", "324px"]);
        const flexibleColumnSeeds = new Set(["310px", "282px", "257px"]);
        const markAncestorsFluid = seed => {
          let parent = seed.parentElement;
          for (let depth = 0; parent && parent !== contentInner && depth < 8; depth += 1, parent = parent.parentElement) {
            if (parent === pageHeader || parent.closest('[data-h5-header="true"]')) break;
            parent.dataset.h5FluidWrap = "true";
            if (parent.getAttribute("data-name") === "Reason") break;
          }
        };

        [...contentInner.querySelectorAll("*")].forEach(node => {
          if (fullWidthSeeds.has(node.style.width)) {
            node.dataset.h5FluidFull = "true";
            markAncestorsFluid(node);
          } else if (flexibleColumnSeeds.has(node.style.width)) {
            node.dataset.h5FluidFlex = "true";
            markAncestorsFluid(node);
          }
        });
      }

      if (managedPage && contentInner) {
        const sections = [...contentInner.children];
        const scrollRegion = [...contentInner.querySelectorAll('[data-name="Reason"]')].filter(node => node !== pageHeader).at(-1);

        document.documentElement.style.height = "100%";
        document.documentElement.style.overflow = "hidden";
        document.body.style.height = "100vh";
        document.body.style.paddingBottom = "0";
        document.body.style.overflow = "hidden";
        root.style.height = "100vh";
        root.style.minHeight = "100vh";
        root.style.overflow = "hidden";
        content.style.height = "calc(100vh - 56px)";
        content.style.minHeight = "0";
        content.style.overflow = "hidden";
        contentInner.style.height = "100%";
        contentInner.style.minHeight = "0";
        contentInner.style.display = "flex";
        contentInner.style.flexDirection = "column";
        contentInner.style.overflow = "hidden";
        sections.forEach(section => { section.style.flexShrink = "0"; });

        if (scrollRegion) {
          scrollRegion.dataset.h5ScrollRegion = document.title.includes("督办") ? "supervision" : "ranking";
          scrollRegion.style.gap = "12px";
          scrollRegion.style.width = "100%";
          scrollRegion.style.height = "auto";
          scrollRegion.style.minHeight = "0";
          scrollRegion.style.flex = "1 1 auto";
          scrollRegion.style.overflowX = "hidden";
          scrollRegion.style.overflowY = "auto";
          scrollRegion.style.overscrollBehavior = "contain";
          [...scrollRegion.children].forEach(child => {
            child.style.width = "100%";
            child.style.maxWidth = "100%";
            child.style.boxSizing = "border-box";
          });
          [...scrollRegion.querySelectorAll('[data-name*="14296"]')].forEach(node => {
            node.style.gap = "12px";
          });
        }
      }
    }

    const bottomNav = directChildren.find(node => node.style.bottom === "0px" && node.style.height === "64px");
    if (bottomNav) {
      bottomNav.style.width = "min(100%, 750px)";
      bottomNav.style.height = "56px";
      bottomNav.style.position = "fixed";
      bottomNav.style.left = "50%";
      bottomNav.style.bottom = "0";
      bottomNav.style.transform = "translateX(-50%)";
      bottomNav.style.zIndex = "30";
      const homeIndicator = [...bottomNav.querySelectorAll("div")].find(node => node.style.width === "112px" && node.style.height === "4px");
      if (homeIndicator?.parentElement) homeIndicator.parentElement.style.display = "none";
    }

    const searchNodes = [...root.querySelectorAll('[data-name="搜索"]')];
    searchNodes.forEach(node => { node.dataset.h5Search = "true"; });

    const nativeDimensionLabels = document.title.includes("经营排行")
      ? ["收入TOP", "利润TOP", "成本TOP"]
      : document.title.includes("运营排行")
        ? ["工单完成率", "设备完好率", "能耗达标率"]
        : [];
    if (nativeDimensionLabels.length) {
      const firstDimension = [...root.querySelectorAll("span")]
        .find(span => nativeDimensionLabels.includes((span.textContent || "").trim()));
      const dimensionTabs = firstDimension?.parentElement?.parentElement;
      if (dimensionTabs) dimensionTabs.dataset.h5DimensionTabs = "true";
    }

    // Keep the exported cards visually aligned with the formal metric table.
    // The workbook defines the number of metrics per domain; the score values
    // remain demo values because the workbook does not contain live measures.
    const metricCounts = { "经营板块": 9, "运营板块": 3, "内控板块": 3, "舆情板块": 4, "创新板块": 3, "安全板块": 5 };
    const metricHealthy = { "经营板块": 6, "运营板块": 3, "内控板块": 3, "舆情板块": 4, "创新板块": 1, "安全板块": 5 };
    const metricScores = { "经营板块": 98, "运营板块": 97, "内控板块": 99, "舆情板块": 96, "创新板块": 88, "安全板块": 99 };
    const metricHighlights = {
      "经营板块": "收入/利润/现金流",
      "运营板块": "满意度/投诉闭环",
      "内控板块": "审计/流程/付款",
      "舆情板块": "负面事件/响应",
      "创新板块": "知识产权/合同/研发",
      "安全板块": "事故/隐患/培训"
    };
    [...root.querySelectorAll('[data-name="Button"]')].forEach(card => {
      const cardText = (card.textContent || "").replace(/\s+/g, "");
      const domain = Object.keys(metricCounts).find(label => cardText.includes(label));
      if (!domain) return;
      card.dataset.h5Indicator = domain.replace("板块", "");
      card.style.cursor = "pointer";
      const score = [...card.querySelectorAll("span")].find(span => /^\s*\d{2,3}\s*$/.test(span.textContent || ""));
      if (score) score.textContent = String(metricScores[domain]);
      [...card.querySelectorAll("span")].filter(span => (span.textContent || "").includes("年度指标")).forEach(span => {
        span.textContent = `正式指标 ${metricCounts[domain]} 项 · ${metricHighlights[domain]}`;
        span.style.whiteSpace = "nowrap";
        span.style.fontSize = "8px";
      });
      const segmentTrack = [...card.querySelectorAll('[data-name="Paragraph:margin"] > [data-name="Container"]')]
        .find(node => node.children.length >= 3);
      if (segmentTrack) {
        segmentTrack.dataset.h5MetricSegments = "true";
        segmentTrack.replaceChildren(...Array.from({ length: metricCounts[domain] }, (_, index) => {
          const segment = document.createElement("i");
          segment.className = index < metricHealthy[domain] ? "is-achieved" : "";
          return segment;
        }));
      }
    });
    [...root.querySelectorAll('[data-name="Button"], [data-name="容器 14291"], [data-name="容器 14297"]')].forEach(node => {
      node.style.cursor = "pointer";
    });

    // Preserve the full last rank row on native ranking pages. The source
    // frame is a fixed-height export, while the H5 content must grow with it.
    const hasNativeChart = root.querySelector('[data-name="BarChart"]');
    if (hasNativeChart) {
      [...root.querySelectorAll('[data-name="Reason"]')]
        .filter(reason => !reason.dataset.h5ScrollRegion)
        .slice(1)
        .forEach(reason => { reason.style.overflow = "visible"; });
      [...root.querySelectorAll('[data-name="Container"]')]
        .filter(node => node.querySelector('[data-name="BarChart"]'))
        .forEach(card => {
          card.dataset.h5ChartCard = "true";
          if (card.parentElement) card.parentElement.dataset.h5ChartCardWrap = "true";
          card.style.height = "auto";
          card.style.overflow = "visible";
        });
      [...root.querySelectorAll('[data-name="BarChart"]')].forEach(chart => {
        chart.style.width = "100%";
        chart.style.maxWidth = "100%";
      });
    }

    // Amounts in the business ranking are intentionally single-line values.
    [...root.querySelectorAll("span")]
      .filter(node => /^\s*\d+(?:\.\d+)?亿\s*$/.test(node.textContent || ""))
      .forEach(node => {
        node.dataset.h5Amount = "true";
        node.style.whiteSpace = "nowrap";
        node.style.minWidth = "42px";
      });

    [...root.querySelectorAll('[data-name*="14297"]')].forEach(node => {
      node.dataset.h5Dynamic = "true";
    });

    // The supervision export keeps indentation around the explicit <br> in
    // the update label, which turns the intended two lines into four lines.
    // Normalize only the label; the shared dynamic style keeps this bar the
    // same natural height as the ranking page.
    const supervisionDynamicLabel = root.querySelector('[data-node-id="2:8962"]');
    const supervisionDynamicBar = root.querySelector('[data-node-id="2:8948"]');
    if (supervisionDynamicLabel && supervisionDynamicBar) {
      supervisionDynamicLabel.innerHTML = "动态<br>更新";
      supervisionDynamicLabel.style.display = "inline-block";
      supervisionDynamicLabel.style.height = "24px";
      supervisionDynamicLabel.style.lineHeight = "12px";
      supervisionDynamicLabel.style.whiteSpace = "normal";
    }

    // Ranking and supervision share the same wave bitmap, but each export
    // assigns different node ids and places it outside the hero bounds.
    const heroWave = root.querySelector('img[data-name="image.png"][src*="f2b2e3f4d2d5021ee98ed3bf9e6058c5"]');
    const heroWaveLayer = heroWave?.parentElement;
    if (heroWave && heroWaveLayer) {
      heroWaveLayer.style.width = "100%";
      heroWaveLayer.style.height = "100%";
      heroWaveLayer.style.left = "0";
      heroWaveLayer.style.right = "auto";
      heroWaveLayer.style.top = "0";
      heroWaveLayer.style.overflow = "hidden";
      heroWave.style.width = "494px";
      heroWave.style.height = "494px";
      heroWave.style.left = "0";
      heroWave.style.top = "-150px";
      heroWave.style.right = "auto";
      heroWave.style.opacity = "0.3";
      heroWave.style.pointerEvents = "none";
    }

    // The MasterGo export splits the insight copy into zero-width spans and
    // leaves the paragraph at the browser default 16px size. Rebuild the two
    // ranking insights so they keep the designed 10px/15px rhythm and wrap
    // at the same point on the H5 canvas.
    const insightRules = [
      {
        key: "business",
        test: name => name.includes("56.6"),
        lead: "📊 华东+华南合计占总收入 ",
        value: "56.6",
        tail: "%，西南区连续2季度负增长，需重点关注"
      },
      {
        key: "operation",
        test: name => name.includes("98.7"),
        lead: "📊 华东区工单完成率 ",
        value: "98.7",
        tail: "% 领先，西南区 84.6% 严重偏低，需专项督导"
      }
    ];

    [...root.querySelectorAll("p[data-name]")].forEach(paragraph => {
      const rule = insightRules.find(item => item.test(paragraph.getAttribute("data-name") || ""));
      if (!rule) return;

      const spans = [...paragraph.children].filter(node => node.tagName === "SPAN");
      if (spans.length < 3) return;

      [rule.lead, rule.value, rule.tail].forEach((text, index) => {
        const span = spans[index];
        span.textContent = text;
        span.style.width = "auto";
        span.style.display = "inline";
        span.style.fontSize = "10px";
        span.style.lineHeight = "15px";
      });

      paragraph.dataset.h5Insight = rule.key;
      paragraph.style.width = "298px";
      paragraph.style.height = "30px";
      paragraph.style.margin = "0";
      paragraph.style.fontSize = "10px";
      paragraph.style.lineHeight = "15px";
      paragraph.style.overflow = "hidden";
      paragraph.parentElement?.parentElement?.setAttribute("data-h5-insight-container", rule.key);
    });

    if (!document.getElementById("h5-layout-style")) {
      const style = document.createElement("style");
      style.id = "h5-layout-style";
      style.textContent = `
        [data-h5-header="true"] {
          width: 100% !important;
          height: 48px !important;
          min-height: 48px !important;
          padding: 8px 16px !important;
          gap: 0 !important;
          overflow: visible !important;
          background: #fff !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 40 !important;
        }
        [data-h5-overview-header="true"] {
          position: fixed !important;
          top: 0 !important;
          left: 50% !important;
          width: min(100%, 750px) !important;
          max-width: 750px !important;
          transform: translateX(-50%) !important;
          z-index: 40 !important;
        }
        [data-h5-header="true"] > div:first-child {
          width: 100% !important;
          height: 32px !important;
          min-height: 32px !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        [data-h5-header="true"] > div:first-child > div:first-child {
          width: auto !important;
          min-width: 0 !important;
          display: flex !important;
          flex: 1 1 auto !important;
          align-items: center !important;
          gap: 8px !important;
          margin-right: 8px !important;
        }
        [data-h5-header="true"] > div:first-child > div:first-child > div:first-child {
          width: 32px !important;
          height: 32px !important;
          flex: none !important;
          border-radius: 11.64px !important;
        }
        [data-h5-header="true"] > div:first-child > div:first-child > div:first-child [data-name="Icon"] {
          left: 8.73px !important;
          top: 8.73px !important;
        }
        [data-h5-header="true"] > div:first-child > div:first-child > div:first-child [data-name="Icon"] img {
          width: 14.54px !important;
          height: 14.54px !important;
          display: block !important;
        }
        [data-h5-header="true"] > div:first-child > div:last-child {
          height: 32px !important;
          display: flex !important;
          flex: none !important;
          align-items: center !important;
          gap: 6.4px !important;
        }
        [data-h5-header="true"] > div:first-child > div:first-child > div:last-child {
          min-width: 0 !important;
        }
        [data-h5-header="true"] > div:first-child > div:first-child > div:last-child span {
          display: block !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        [data-h5-header="true"] [data-name="Button"] {
          flex-shrink: 0 !important;
        }
        [data-h5-header="true"] [data-name="Button - 打开个人侧边栏"] {
          width: 32px !important;
          height: 32px !important;
          flex: none !important;
          border-radius: 223px !important;
        }
        [data-h5-header="true"] [data-name="Button - 打开个人侧边栏"] [data-name="Icon"] {
          left: 8px !important;
          top: 8px !important;
        }
        [data-h5-header="true"] [data-name="Button - 打开个人侧边栏"] img {
          width: 16px !important;
          height: 16px !important;
          display: block !important;
        }
        [data-h5-content-inner],
        [data-h5-content-inner] > * {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        [data-h5-content-inner] > [data-name="Reason"]:not([data-h5-header="true"]) > * {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        [data-h5-fluid-wrap],
        [data-h5-fluid-full] {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        [data-h5-fluid-flex] {
          width: auto !important;
          max-width: 100% !important;
          min-width: 0 !important;
          flex: 1 1 auto !important;
          box-sizing: border-box !important;
        }
        [data-h5-content-inner] [style*="width: 375px"],
        [data-h5-content-inner] [style*="width: 366px"],
        [data-h5-content-inner] [style*="width: 364px"],
        [data-h5-content-inner] [style*="width: 356px"],
        [data-h5-content-inner] [style*="width: 351px"],
        [data-h5-content-inner] [style*="width: 343px"],
        [data-h5-content-inner] [style*="width: 341px"],
        [data-h5-content-inner] [style*="width: 340px"],
        [data-h5-content-inner] [style*="width: 324px"] {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        [data-name="容器 14295"] {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          flex: 1 1 auto !important;
        }
        [data-name="容器 14295"] > [data-name="容器 14293"] {
          width: auto !important;
          min-width: 0 !important;
          flex: 1 1 auto !important;
        }
        [data-name="容器 14295"] > [data-name="容器 14293"] > span {
          min-width: 0 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        [data-h5-dynamic] > [data-name="Text"] {
          right: 2px !important;
          left: auto !important;
        }
        [data-h5-scroll-region] [style*="width: 310px"] {
          width: auto !important;
          min-width: 0 !important;
          flex: 1 1 auto !important;
        }
        [data-h5-scroll-region] [style*="width: 257px"] {
          width: auto !important;
          min-width: 0 !important;
          flex: 1 1 auto !important;
        }
        [data-h5-content-inner] [style*="width: 302px"] {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        [data-h5-search] {
          position: relative !important;
          width: 14px !important;
          height: 14px !important;
          flex: none !important;
        }
        [data-h5-search] > * { display: none !important; }
        [data-h5-search]::before {
          content: "";
          position: absolute;
          left: 1px;
          top: 1px;
          width: 8px;
          height: 8px;
          border: 1.35px solid #477AFC;
          border-radius: 50%;
          box-sizing: border-box;
        }
        [data-h5-search]::after {
          content: "";
          position: absolute;
          left: 8px;
          top: 9px;
          width: 4px;
          height: 1.35px;
          border-radius: 2px;
          background: #477AFC;
          transform: rotate(45deg);
          transform-origin: left center;
        }
        [data-h5-amount] { white-space: nowrap !important; }
        [data-h5-metric-segments] {
          height: 4px !important;
          display: flex !important;
          align-items: stretch !important;
          gap: 2px !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        [data-h5-metric-segments] > i {
          min-width: 0 !important;
          height: 4px !important;
          display: block !important;
          flex: 1 !important;
          border-radius: 8px !important;
          background: #D8DDE5 !important;
        }
        [data-h5-metric-segments] > i.is-achieved { background: #22C55E !important; }
        [data-h5-chart-card-wrap],
        [data-h5-chart-card] {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        [data-h5-chart-card] {
          height: auto !important;
          overflow: visible !important;
          border-radius: 16px !important;
        }
        [data-h5-scroll-region] {
          height: auto !important;
          min-height: 0 !important;
          flex: 1 1 auto !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          scrollbar-width: none !important;
          -webkit-overflow-scrolling: touch;
        }
        [data-h5-scroll-region]::-webkit-scrollbar { display: none !important; }
        [data-native-interactive-chart="true"] {
          width: 100% !important;
          height: 126px !important;
          padding: 0 12px !important;
          overflow: hidden !important;
        }
        .native-chart-bars {
          width: 100%;
          min-width: 0;
          height: 126px;
          flex: none;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          gap: 12px;
          padding: 16px 10px 6px;
          border-bottom: 1px solid #EEF2F7;
          box-sizing: border-box;
        }
        .native-chart-column {
          min-width: 0;
          height: 100%;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-direction: column;
          gap: 4px;
          position: relative;
        }
        .native-chart-column i {
          width: 18px;
          max-height: 84px;
          display: block;
          border-radius: 5px 5px 0 0;
          background: var(--native-bar);
          transition: height 180ms ease;
        }
        .native-chart-column span { color: #AAB8CC; font-size: 9px; line-height: 11px; }
        .native-chart-value {
          position: absolute;
          top: -2px;
          left: 50%;
          padding: 2px 4px;
          border: 1px solid #E6EBF3;
          border-radius: 6px;
          color: #51627F;
          background: #fff;
          font-size: 8px;
          white-space: nowrap;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 160ms ease;
        }
        .native-chart-column:first-child .native-chart-value { opacity: 1; }
        [data-h5-dynamic] {
          height: auto !important;
          min-height: 40px !important;
          border: 1px solid rgba(255,255,255,0.78) !important;
          border-image: none !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 1px 4px rgba(30,50,120,0.08) !important;
        }
        [data-h5-insight-container] {
          width: 100% !important;
          max-width: 100% !important;
          min-height: 48px !important;
          height: 48px !important;
          box-sizing: border-box !important;
          padding: 8px 12px !important;
          border-radius: 16px !important;
        }
        [data-h5-insight] {
          width: 100% !important;
          max-width: 100% !important;
          height: 30px !important;
          margin: 0 !important;
          font-size: 10px !important;
          line-height: 15px !important;
          font-family: AlibabaPuHuiTi, sans-serif !important;
          font-weight: 700 !important;
          color: #3D5275 !important;
          overflow: hidden !important;
          display: block !important;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
          letter-spacing: 0 !important;
        }
        [data-h5-insight="business"] { color: #3D5275 !important; }
        [data-h5-insight="operation"] { color: #7C3A0D !important; }
        [data-h5-insight] > span {
          width: auto !important;
          font-size: 10px !important;
          line-height: 15px !important;
          font-family: AlibabaPuHuiTi, sans-serif !important;
          font-weight: 400 !important;
          color: #3D5275 !important;
        }
        [data-h5-insight] > span:nth-child(2) { font-weight: 700 !important; }
        [data-h5-dimension-tabs] {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 4px !important;
          box-sizing: border-box !important;
        }
        [data-h5-dimension-tabs] > [data-name="Button"] {
          width: auto !important;
          min-width: 0 !important;
          flex: 1 1 0 !important;
          box-sizing: border-box !important;
        }
        [data-h5-dimension-tabs] > [data-name="Button"] span {
          max-width: 100% !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          font-size: 10px !important;
          line-height: 15px !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyH5Layout);
  else applyH5Layout();
})();
