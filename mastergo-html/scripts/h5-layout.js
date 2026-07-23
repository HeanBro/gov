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

    // Preserve the full last rank row on native ranking pages. The source
    // frame is a fixed-height export, while the H5 content must grow with it.
    const hasNativeChart = root.querySelector('[data-name="BarChart"]');
    if (hasNativeChart) {
      [...root.querySelectorAll('[data-name="Reason"]')].slice(1).forEach(reason => {
        reason.style.overflow = "visible";
      });
      [...root.querySelectorAll('[data-name="Container"]')]
        .filter(node => node.querySelector('[data-name="BarChart"]'))
        .forEach(card => {
          card.dataset.h5ChartCard = "true";
          card.style.height = "auto";
          card.style.overflow = "visible";
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
    // Normalize that label and restore the compact update bar height.
    const supervisionDynamicLabel = root.querySelector('[data-node-id="2:8962"]');
    const supervisionDynamicBar = root.querySelector('[data-node-id="2:8948"]');
    if (supervisionDynamicLabel && supervisionDynamicBar) {
      supervisionDynamicLabel.innerHTML = "动态<br>更新";
      supervisionDynamicLabel.style.display = "inline-block";
      supervisionDynamicLabel.style.height = "24px";
      supervisionDynamicLabel.style.lineHeight = "12px";
      supervisionDynamicLabel.style.whiteSpace = "normal";
      supervisionDynamicBar.style.height = "34px";
      supervisionDynamicBar.style.minHeight = "34px";
    }

    // The wave bitmap was exported with an absolute position outside the
    // hero, leaving only the small right-side block decoration visible.
    // Re-anchor it to the hero bounds so the MasterGo background is visible.
    const supervisionWave = root.querySelector('[data-node-id="2:9001"]');
    const supervisionWaveLayer = root.querySelector('[data-node-id="2:9000"]');
    if (supervisionWave && supervisionWaveLayer) {
      supervisionWaveLayer.style.width = "100%";
      supervisionWaveLayer.style.height = "100%";
      supervisionWaveLayer.style.left = "0";
      supervisionWaveLayer.style.right = "auto";
      supervisionWaveLayer.style.top = "0";
      supervisionWaveLayer.style.overflow = "hidden";
      supervisionWave.style.width = "494px";
      supervisionWave.style.height = "494px";
      supervisionWave.style.left = "0";
      supervisionWave.style.top = "-150px";
      supervisionWave.style.right = "auto";
      supervisionWave.style.opacity = "0.3";
      supervisionWave.style.pointerEvents = "none";
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
        }
        [data-h5-header="true"] > div:first-child {
          width: 100% !important;
          height: 32px !important;
          min-height: 32px !important;
        }
        [data-h5-header="true"] [data-name="Button"] {
          flex-shrink: 0 !important;
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
        [data-h5-chart-card] {
          height: auto !important;
          overflow: visible !important;
          border-radius: 16px !important;
        }
        [data-h5-dynamic] {
          border: 1px solid rgba(255,255,255,0.78) !important;
          border-image: none !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 1px 4px rgba(30,50,120,0.08) !important;
        }
        [data-h5-insight-container] {
          min-height: 66px !important;
          height: 66px !important;
          box-sizing: border-box !important;
          padding: 8px 12px !important;
          border-radius: 16px !important;
        }
        [data-h5-insight] {
          width: 298px !important;
          height: 30px !important;
          margin: 0 !important;
          font-size: 10px !important;
          line-height: 15px !important;
          overflow: hidden !important;
        }
        [data-h5-insight] > span {
          width: auto !important;
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
