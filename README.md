# A股盈利模型 MVP

一个可运行的 A 股盈利模型网站骨架，当前以模拟 / 降级数据链路演示以下最小闭环：

- 首页：最热题材、核心联动股、主标签 `P_hit_3d_5pct`
- 个股分析页：情绪 + 相似度双因子拆解、历史相似案例、风险提示
- 样本外观测页：`2026-05-06` 冻结、`2026-05-06/07/11` 三阶段回填、失败留痕
- 最小 API：市场总览、个股详情、观测状态、冻结与回填接口

## 主标签口径

网站主展示统一为：

`未来 3 个交易日达到 +5% 收益目标的历史条件概率`

对应定义：

- `T+1` 开盘建仓
- `T+3` 收盘结算
- 收益定义：`close(T+3) / open(T+1) - 1`
- 命中条件：`>= 5%`
- 若 `T=2026-05-06`，则收益窗口为 `2026-05-07` 至 `2026-05-11`

`2026-05-06` 只能表述为首个样本外观测日，不能表述为模型准确性已经验证完成。

## 运行

要求：Node.js 22+

```bash
npm install
npm start
```

默认启动在 `http://127.0.0.1:3000`。

- 首页：`/`
- 核心分析页：`/analysis?code=300308`
- 样本外观测页：`/acceptance`
- 健康检查：`/api/v1/health/live`

## 测试

```bash
npm test
```

当前测试覆盖：

- 主标签口径输出
- `/api/v1/*` 兼容路径
- 冻结接口 append-only 约束

## 数据链路与降级策略

当前版本默认使用 `apps/api/demo-data.js` 中的模拟数据驱动前后端页面，便于先跑通 UI、接口、冻结与回填链路。

### 当前降级策略

- 若样本量 `< 12`，`probability.degraded = true`
- 降级时主字段仍返回 `p_hit_3d_5pct`，但 `label` 改为 `参考信号`
- 所有主概率同时返回：
  - `sample_size`
  - `snapshot_time`
  - `model_version`
  - `calibration_version`
  - `degraded`
- 首页、分析页不展示任何“已验证表现”数字；观测结果只在 `/acceptance` 通过冻结后逐步回填

### 回填链路

- `2026-05-06 09:25`：`POST /api/v1/validation/freeze?tradeDate=2026-05-06`
- `2026-05-06 15:00`：`POST /api/v1/validation/backfill?tradeDate=2026-05-06`，`stage=day0_close`
- `2026-05-07 15:00`：`POST /api/v1/validation/backfill?tradeDate=2026-05-06`，`stage=t1`
- `2026-05-11 15:00`：`POST /api/v1/validation/backfill?tradeDate=2026-05-06`，`stage=t3_final`

冻结记录写入：

- `apps/api/runtime/freezes/2026-05-06.json`
- `apps/api/runtime/validation-audit.log`

冻结后只允许追加 outcome，不允许覆盖原始主池成员、冻结时间和原始概率。

## 代码结构

- `apps/api/server.js`：Node HTTP 服务与接口
- `apps/api/demo-data.js`：模拟市场数据、题材与股票样本
- `apps/api/model.js`：情绪 + 相似度双因子原型算法
- `apps/api/audit-store.js`：冻结 / 回填 / 留痕
- `apps/web/`：首页、分析页、样本外观测页和样式
- `docs/deployment.md`：部署与联调说明

## 后续补齐

- 接入真实最热题材与核心股抓取
- 补历史 K 线 / 成交量回放与真实相似度检索
- 将模拟数据链路切换为可配置的数据源适配器
- 对接授权行情源后补正式商用合规链路
