# A股盈利模型 MVP 部署说明

- 运行时：Node.js 22
- 启动命令：`npm start`
- 健康检查：`GET /healthz`
- 前端入口：`/`
- 核心分析页：`/analysis?code=300308`
- 5月6日验收页：`/acceptance`
- 资源需求：单实例即可，1 vCPU / 512MB 内存可运行演示版
- 环境变量：`PORT`
- 数据源口径：公开行情源仅用于内部 MVP 验证 / 演示，正式商用需切换授权数据源
- 审计文件：`apps/api/runtime/freezes/*.json` 与 `apps/api/runtime/validation-audit.log`

## 5月6日观测流程

1. `09:25` 前调用 `POST /api/validation/freeze?tradeDate=2026-05-06`
2. `15:00` 后调用 `POST /api/validation/backfill?tradeDate=2026-05-06`
3. `2026-05-07 15:00` 再次追加回填 `stage=t1`
4. `2026-05-11 15:00` 追加最终 `stage=t3_final`

## 文案边界

- 主标签固定为“未来 3 个交易日达到 +5% 收益目标的历史条件概率”
- `2026-05-06` 仅为实验性 MVP 首个样本外观测日
- 对外文案不得宣称模型已完成准确性验证，也不得使用强确定性概率话术
