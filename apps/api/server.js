import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { appendBackfill, appendAudit, readFreeze, writeFreeze } from "./audit-store.js";
import { buildDataset } from "./demo-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, "../web");

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendFile(response, filePath) {
  if (!fs.existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const extension = path.extname(filePath);
  const contentType = extension === ".css"
    ? "text/css; charset=utf-8"
    : extension === ".js"
      ? "application/javascript; charset=utf-8"
      : "text/html; charset=utf-8";
  response.writeHead(200, { "Content-Type": contentType });
  response.end(fs.readFileSync(filePath));
}

function getCandidatePool(dataset) {
  const topThemes = dataset.themes.slice(0, 3).map((theme) => theme.name);
  const candidates = dataset.stocks
    .filter((stock) => topThemes.includes(stock.theme))
    .sort((left, right) => right.probability.p_hit_3d_5pct - left.probability.p_hit_3d_5pct);
  return candidates.slice(0, 10).map((stock, index) => ({
    rank: index + 1,
    code: stock.code,
    name: stock.name,
    theme: stock.theme,
    p_hit_3d_5pct: stock.probability.p_hit_3d_5pct,
    sample_size: stock.probability.sample_size,
    snapshot_time: stock.probability.snapshot_time,
    model_version: stock.probability.model_version,
    calibration_version: stock.probability.calibration_version,
    degraded: stock.probability.degraded
  }));
}

async function parseBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (!chunks.length) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function datasetPayload() {
  const dataset = buildDataset();
  return {
    ...dataset,
    primary_label: "未来 3 个交易日达到 +5% 收益目标的历史条件概率",
    disclaimer: "当前为内部 MVP 验证 / 演示数据源，正式商用需切换至授权数据源。",
    observation_day_label: "2026-05-06 为实验性 MVP 首个样本外观测日"
  };
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const dataset = datasetPayload();

  if (url.pathname === "/healthz") {
    sendJson(response, 200, {
      ok: true,
      runtime: "node-http",
      snapshot_time: dataset.snapshotTime
    });
    return;
  }

  if (url.pathname === "/api/market-overview") {
    sendJson(response, 200, {
      indices: dataset.indices,
      themes: dataset.themes,
      primary_signal: dataset.featuredSignal,
      disclaimer: dataset.disclaimer,
      primary_label: dataset.primary_label
    });
    return;
  }

  if (url.pathname === "/api/stocks") {
    sendJson(response, 200, {
      items: dataset.rankedSignals,
      primary_label: dataset.primary_label
    });
    return;
  }

  if (url.pathname.startsWith("/api/stocks/")) {
    const code = url.pathname.split("/").pop();
    const stock = dataset.stocks.find((item) => item.code === code);
    if (!stock) {
      sendJson(response, 404, { error: "stock_not_found" });
      return;
    }
    sendJson(response, 200, {
      item: stock,
      primary_label: dataset.primary_label,
      acceptance_note: dataset.observation_day_label
    });
    return;
  }

  if (url.pathname === "/api/validation/status") {
    const tradeDate = url.searchParams.get("tradeDate") || "2026-05-06";
    const frozen = readFreeze(tradeDate);
    sendJson(response, 200, {
      trade_date: tradeDate,
      freeze_rule: "热题材 Top3 x 每题材核心股 Top5 候选池，再按 P_hit_3d_5pct 排序取 Top10",
      frozen,
      helper_metric_note: "P_close_up_today 仅作为当日收盘方向观测字段，不替代主模型验证。"
    });
    return;
  }

  if (url.pathname === "/api/validation/freeze" && request.method === "POST") {
    const tradeDate = url.searchParams.get("tradeDate") || "2026-05-06";
    const body = await parseBody(request);
    const now = body.frozen_at || "2026-05-06T09:25:00+08:00";
    const payload = {
      trade_date: tradeDate,
      frozen_at: now,
      freeze_rule: "热题材 Top3 x 每题材核心股 Top5 候选池，再按 P_hit_3d_5pct 排序取 Top10",
      pool: getCandidatePool(dataset),
      source_scope: "公开行情源仅用于内部 MVP 验证 / 演示，正式商用需切换授权源。",
      immutable_fields: ["pool", "frozen_at", "freeze_rule"]
    };
    const result = writeFreeze(tradeDate, payload);
    sendJson(response, result.ok ? 201 : 409, result);
    return;
  }

  if (url.pathname === "/api/validation/backfill" && request.method === "POST") {
    const tradeDate = url.searchParams.get("tradeDate") || "2026-05-06";
    const body = await parseBody(request);
    if (!body.stage || !Array.isArray(body.items)) {
      sendJson(response, 400, { error: "invalid_backfill_payload" });
      return;
    }
    const result = appendBackfill(tradeDate, {
      stage: body.stage,
      filled_at: body.filled_at || new Date().toISOString(),
      items: body.items
    });
    sendJson(response, result.ok ? 200 : 409, result);
    return;
  }

  if (url.pathname === "/api/validation/failure" && request.method === "POST") {
    const body = await parseBody(request);
    appendAudit({
      event: "snapshot_failure",
      trade_date: body.trade_date || "2026-05-06",
      reason: body.reason || "unknown",
      details: body.details || null
    });
    sendJson(response, 202, { ok: true });
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    sendFile(response, path.join(webRoot, "index.html"));
    return;
  }

  if (url.pathname === "/analysis" || url.pathname === "/analysis.html") {
    sendFile(response, path.join(webRoot, "analysis.html"));
    return;
  }

  if (url.pathname === "/acceptance" || url.pathname === "/acceptance.html") {
    sendFile(response, path.join(webRoot, "acceptance.html"));
    return;
  }

  const assetPath = path.join(webRoot, url.pathname);
  if (assetPath.startsWith(webRoot) && fs.existsSync(assetPath)) {
    sendFile(response, assetPath);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

const port = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`A-share profit model MVP listening on http://127.0.0.1:${port}`);
  });
}

export { server };
