import fs from "node:fs";
import path from "node:path";

const RUNTIME_DIR = path.resolve("/workspace/project/apps/api/runtime");
const AUDIT_LOG = path.join(RUNTIME_DIR, "validation-audit.log");
const FREEZE_DIR = path.join(RUNTIME_DIR, "freezes");

function ensureRuntime() {
  fs.mkdirSync(FREEZE_DIR, { recursive: true });
}

function appendAudit(entry) {
  ensureRuntime();
  fs.appendFileSync(AUDIT_LOG, `${JSON.stringify({ ...entry, audited_at: new Date().toISOString() })}\n`, "utf8");
}

function freezePath(tradeDate) {
  return path.join(FREEZE_DIR, `${tradeDate}.json`);
}

function readFreeze(tradeDate) {
  ensureRuntime();
  const filePath = freezePath(tradeDate);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeFreeze(tradeDate, payload) {
  ensureRuntime();
  const filePath = freezePath(tradeDate);
  if (fs.existsSync(filePath)) {
    appendAudit({
      event: "freeze_rejected",
      trade_date: tradeDate,
      reason: "freeze_exists"
    });
    return { ok: false, error: "freeze_exists" };
  }
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
  appendAudit({
    event: "freeze_created",
    trade_date: tradeDate,
    pool_size: payload.pool.length,
    frozen_at: payload.frozen_at
  });
  return { ok: true, payload };
}

function appendBackfill(tradeDate, payload) {
  ensureRuntime();
  const frozen = readFreeze(tradeDate);
  if (!frozen) {
    appendAudit({
      event: "backfill_rejected",
      trade_date: tradeDate,
      reason: "freeze_missing"
    });
    return { ok: false, error: "freeze_missing" };
  }
  const next = {
    ...frozen,
    outcomes: [...(frozen.outcomes || []), payload]
  };
  fs.writeFileSync(freezePath(tradeDate), JSON.stringify(next, null, 2), "utf8");
  appendAudit({
    event: "backfill_appended",
    trade_date: tradeDate,
    stage: payload.stage,
    items: payload.items.length
  });
  return { ok: true, payload: next };
}

export {
  appendAudit,
  appendBackfill,
  readFreeze,
  writeFreeze
};
