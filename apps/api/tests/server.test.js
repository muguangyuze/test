import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

process.env.NODE_ENV = "test";
process.env.PORT = "3101";

fs.rmSync(path.resolve("/workspace/project/apps/api/runtime"), {
  recursive: true,
  force: true
});

const { server } = await import("../server.js");

await new Promise((resolve) => {
  server.listen(3101, resolve);
});

test("market overview exposes corrected primary label", async () => {
  const response = await fetch("http://127.0.0.1:3101/api/market-overview");
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.primary_label, "未来 3 个交易日达到 +5% 收益目标的历史条件概率");
  assert.ok(payload.primary_signal.probability.sample_size > 0);
  assert.ok(Object.hasOwn(payload.primary_signal.probability, "model_version"));
});

test("stock detail keeps P_close_up_today out of main label", async () => {
  const response = await fetch("http://127.0.0.1:3101/api/stocks/300308");
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.primary_label, "未来 3 个交易日达到 +5% 收益目标的历史条件概率");
  assert.ok(payload.item.probability.p_hit_3d_5pct >= 0.05);
  assert.ok(payload.item.probability.p_close_up_today >= 0.05);
});

test("freeze endpoint is append-only", async () => {
  const first = await fetch("http://127.0.0.1:3101/api/validation/freeze?tradeDate=2026-05-06", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frozen_at: "2026-05-06T09:25:00+08:00" })
  });
  assert.equal(first.status, 201);

  const second = await fetch("http://127.0.0.1:3101/api/validation/freeze?tradeDate=2026-05-06", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frozen_at: "2026-05-06T09:26:00+08:00" })
  });
  assert.equal(second.status, 409);
});

test.after(() => {
  server.close();
});
