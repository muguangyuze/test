async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function signedPercent(value) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function linePath(values, width, height) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const normalized = (value - min) / ((max - min) || 1);
    const y = height - (normalized * height);
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return points.join(" ");
}

function renderLine(container, values, stroke = "#38BDF8") {
  const width = 600;
  const height = 220;
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <path d="${linePath(values, width, height)}" fill="none" stroke="${stroke}" stroke-width="3" />
    </svg>
  `;
}

function renderMiniLine(container, values, stroke = "#22C55E") {
  const width = 220;
  const height = 74;
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <path d="${linePath(values, width, height)}" fill="none" stroke="${stroke}" stroke-width="2.5" />
    </svg>
  `;
}

function stockSeries(seed) {
  const values = [];
  let current = seed;
  for (let index = 0; index < 36; index += 1) {
    current += ((index % 7) - 3) * 0.8 + (index > 20 ? 1.2 : 0.3);
    values.push(Number(current.toFixed(2)));
  }
  return values;
}

function setText(id, value) {
  const target = document.getElementById(id);
  if (target) {
    target.textContent = value;
  }
}

async function initHome() {
  const data = await fetchJson("/api/market-overview");
  const stock = data.primary_signal;

  document.getElementById("indices").innerHTML = data.indices.map((item) => `
    <div class="card index-card">
      <div class="muted">${item.name}</div>
      <div class="value">${item.display || item.value.toLocaleString("zh-CN")}</div>
      <div class="muted">${item.change ? `${item.change > 0 ? "+" : ""}${item.change}` : "较昨日报"} ${item.changePct ? signedPercent(item.changePct) : `+${item.yoy.toFixed(2)}%`}</div>
    </div>
  `).join("");

  setText("hero-stock", `${stock.name} ${stock.code}`);
  setText("hero-sector", `${stock.sector} • ${stock.concepts.join(" / ")}`);
  setText("hero-probability", percent(stock.probability.p_hit_3d_5pct));
  setText("hero-label", data.primary_label);
  setText("hero-meta", `样本量 ${stock.probability.sample_size} · ${stock.probability.model_version} · ${stock.probability.label}`);
  setText("hero-note", "主卡固定解释为 T+1 开盘建仓至 T+3 收盘收益 >= 5% 的历史条件概率估计。");
  setText("observation-note", data.observation_day_label);
  setText("source-note", data.disclaimer);

  document.getElementById("themes-body").innerHTML = data.themes.map((theme) => `
    <tr>
      <td>${theme.rank}</td>
      <td>${theme.name}</td>
      <td>
        <div class="hot-cell">
          <div class="bar" style="width:${theme.heat}%;"></div>
          <span>${theme.heat.toFixed(1)}</span>
        </div>
      </td>
      <td style="color:#f87171;">+${theme.changePct.toFixed(2)}%</td>
      <td>${theme.leader} ${theme.leaderCode}</td>
    </tr>
  `).join("");

  document.getElementById("linked-stocks").innerHTML = data.themes
    .flatMap((theme) => data.primary_signal.theme === theme.name ? data.themes : [theme])
    .slice(0, 4)
    .map((theme) => `
      <a class="stock-chip" href="/analysis?code=${theme.leaderCode}">
        <div>${theme.leader}</div>
        <div class="muted">${theme.name}</div>
        <div style="margin-top:6px;color:#f87171;">+${theme.changePct.toFixed(2)}%</div>
      </a>
    `).join("");

  setText("factor-emotion", `${Math.round(stock.probability.factor_breakdown.emotion_score * 100)}`);
  setText("factor-similarity", `${Math.round(stock.probability.factor_breakdown.similarity_score * 100)}`);

  document.getElementById("emotion-bars").innerHTML = Object.entries(stock.emotion).map(([key, value]) => `
    <div class="row">
      <span>${key}</span>
      <div class="track"><span style="width:${value}%;"></span></div>
      <strong>${value}</strong>
    </div>
  `).join("");

  document.getElementById("similarity-bars").innerHTML = stock.similarCases.slice(0, 4).map((item) => `
    <div class="row">
      <span>${item.window}</span>
      <div class="track"><span style="width:${item.similarity * 100}%;"></span></div>
      <strong>${Math.round(item.similarity * 100)}</strong>
    </div>
  `).join("");

  document.getElementById("acceptance-metrics").innerHTML = `
    <div class="metric"><div class="muted">冻结批次</div><strong>09:25</strong></div>
    <div class="metric"><div class="muted">主池状态</div><strong>待创建</strong></div>
    <div class="metric"><div class="muted">首日回填</div><strong>待 15:00</strong></div>
    <div class="metric"><div class="muted">最终结算</div><strong>待 05-11</strong></div>
  `;

  document.getElementById("acceptance-checklist").innerHTML = `
    <div>09:15 生成候选池快照</div>
    <div>09:16 完成情绪与相似度打分</div>
    <div>09:25 冻结主验收池并写入审计日志</div>
    <div>15:00 追加首日路径观测 outcome</div>
    <div>2026-05-07 15:00 追加 T+1 中间结果</div>
    <div>2026-05-11 15:00 追加 T+3 最终结算</div>
  `;

  renderLine(document.getElementById("hero-chart"), stockSeries(96), "#38BDF8");
}

async function initAnalysis() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "300308";
  const data = await fetchJson(`/api/stocks/${code}`);
  const stock = data.item;

  setText("analysis-stock", `${stock.name} ${stock.code}`);
  setText("analysis-sector", `${stock.sector} / ${stock.concepts.join(" / ")}`);
  setText("analysis-probability", percent(stock.probability.p_hit_3d_5pct));
  setText("analysis-label", data.primary_label);
  setText("analysis-window", "收益窗口：T+1 开盘建仓 → T+3 收盘结算");
  setText("analysis-note", data.acceptance_note);
  setText("analysis-meta", `样本量 ${stock.probability.sample_size} · 校准 ${stock.probability.calibration_version} · ${stock.probability.label}`);

  document.getElementById("scenarios").innerHTML = `
    <div class="scenario">多头情景 140 - 148.0 区间 · 概率 55%</div>
    <div class="scenario">基准情景 128 - 136.0 区间 · 概率 30%</div>
    <div class="scenario">空头情景 118 - 124.0 区间 · 概率 15%</div>
  `;

  document.getElementById("similar-cases").innerHTML = stock.similarCases.slice(0, 3).map((item, index) => `
    <div class="similar-case">
      <div>
        <div class="pill">相似度 ${Math.round(item.similarity * 100)}%</div>
        <div class="mini-line" id="case-line-${index}"></div>
      </div>
      <div>
        <div>${item.window}</div>
        <div class="muted">持续交易日 ${item.holdDays}</div>
      </div>
      <div>
        <div style="color:#f87171;">${(item.maxGain * 100).toFixed(2)}%</div>
        <div class="muted">${item.hit3d5pct ? "命中 +5% 目标" : "未命中目标"}</div>
      </div>
    </div>
  `).join("");

  document.getElementById("factor-table").innerHTML = `
    <div class="row"><span>情绪因子 (40%)</span><div class="track"><span style="width:${stock.probability.factor_breakdown.emotion_score * 100}%;"></span></div><strong>${(stock.probability.factor_breakdown.emotion_score * 10).toFixed(1)}</strong></div>
    <div class="row"><span>相似度因子 (60%)</span><div class="track"><span style="width:${stock.probability.factor_breakdown.similarity_score * 100}%;"></span></div><strong>${(stock.probability.factor_breakdown.similarity_score * 10).toFixed(1)}</strong></div>
  `;

  document.getElementById("emotion-diagnostics").innerHTML = Object.entries(stock.emotion).map(([key, value]) => `
    <div class="row">
      <span>${key}</span>
      <div class="track"><span style="width:${value}%;"></span></div>
      <strong>${value}%</strong>
    </div>
  `).join("");

  document.getElementById("risk-notes").innerHTML = stock.riskNotes.map((note) => `
    <div class="scenario">${note}</div>
  `).join("");

  document.getElementById("signal-timeline").innerHTML = stock.timeline.map((item) => `
    <div class="timeline-item">
      <div>${item.time}</div>
      <div class="timeline-dot" style="background:${item.result === "观察" ? "#F59E0B" : "#22C55E"};"></div>
      <div>${item.label}</div>
      <div class="muted">${item.result}</div>
    </div>
  `).join("");

  renderLine(document.getElementById("analysis-chart"), stockSeries(92), "#22D3EE");
  stock.similarCases.slice(0, 3).forEach((item, index) => {
    renderMiniLine(document.getElementById(`case-line-${index}`), stockSeries(18 + (index * 6)), item.hit3d5pct ? "#22C55E" : "#F59E0B");
  });
}

async function initAcceptance() {
  const status = await fetchJson("/api/validation/status?tradeDate=2026-05-06");
  const container = document.getElementById("freeze-status");
  const helper = document.getElementById("helper-note");

  if (!status.frozen) {
    container.innerHTML = `<div class="callout">当前还没有冻结样本。点击“创建 09:25 冻结样本”可生成首批不可覆盖记录。</div>`;
  } else {
    container.innerHTML = `
      <div class="callout">已冻结：${status.frozen.frozen_at}</div>
      <div class="callout">规则：${status.freeze_rule}</div>
      <div class="callout">主池规模：${status.frozen.pool.length} 只，后续仅允许追加回填 outcome 字段。</div>
    `;
    document.getElementById("freeze-table").innerHTML = status.frozen.pool.map((item) => `
      <tr>
        <td>${item.rank}</td>
        <td>${item.name} ${item.code}</td>
        <td>${item.theme}</td>
        <td>${percent(item.p_hit_3d_5pct)}</td>
        <td>${item.sample_size}</td>
        <td>${item.degraded ? "是" : "否"}</td>
      </tr>
    `).join("");
  }

  helper.textContent = status.helper_metric_note;

  document.getElementById("freeze-button").addEventListener("click", async () => {
    const response = await fetch("/api/validation/freeze?tradeDate=2026-05-06", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frozen_at: "2026-05-06T09:25:00+08:00" })
    });
    const result = await response.json();
    if (!response.ok) {
      alert("冻结失败或已存在冻结记录，系统已留痕。");
      return;
    }
    window.location.reload();
  });
}

const page = document.body.dataset.page;
if (page === "home") {
  initHome();
}
if (page === "analysis") {
  initAnalysis();
}
if (page === "acceptance") {
  initAcceptance();
}
