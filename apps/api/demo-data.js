import { computeProbability } from "./model.js";

const snapshotTime = "2026-05-06T09:25:00+08:00";

const stocks = [
  {
    code: "300308",
    name: "中际旭创",
    theme: "算力",
    sector: "通信设备",
    concepts: ["CPO", "高速光模块"],
    latestPrice: 128.62,
    changePct: 2.48,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "126.0 - 138.0",
    snapshotTime,
    emotion: {
      themeHeat: 95,
      capitalFlow: 84,
      breadth: 88,
      limitUpGene: 76,
      leaderMomentum: 91
    },
    similarCases: [
      { similarity: 0.91, ageDays: 230, hit3d5pct: true, window: "2023-04-10 - 2023-05-19", maxGain: 0.4231, holdDays: 27 },
      { similarity: 0.87, ageDays: 612, hit3d5pct: true, window: "2021-07-05 - 2021-08-10", maxGain: 0.3678, holdDays: 24 },
      { similarity: 0.82, ageDays: 1295, hit3d5pct: true, window: "2019-11-11 - 2019-12-20", maxGain: 0.3355, holdDays: 26 },
      { similarity: 0.79, ageDays: 540, hit3d5pct: false, window: "2024-01-08 - 2024-02-02", maxGain: 0.021, holdDays: 14 },
      { similarity: 0.76, ageDays: 918, hit3d5pct: true, window: "2022-06-02 - 2022-07-01", maxGain: 0.156, holdDays: 19 },
      { similarity: 0.74, ageDays: 405, hit3d5pct: true, window: "2024-05-06 - 2024-05-28", maxGain: 0.081, holdDays: 16 },
      { similarity: 0.73, ageDays: 330, hit3d5pct: false, window: "2024-08-07 - 2024-09-03", maxGain: 0.018, holdDays: 13 },
      { similarity: 0.71, ageDays: 777, hit3d5pct: true, window: "2023-01-13 - 2023-02-08", maxGain: 0.109, holdDays: 17 },
      { similarity: 0.7, ageDays: 870, hit3d5pct: false, window: "2022-09-14 - 2022-10-12", maxGain: 0.03, holdDays: 15 },
      { similarity: 0.69, ageDays: 1440, hit3d5pct: true, window: "2018-03-07 - 2018-04-03", maxGain: 0.211, holdDays: 18 },
      { similarity: 0.68, ageDays: 1100, hit3d5pct: true, window: "2020-08-11 - 2020-09-01", maxGain: 0.134, holdDays: 16 },
      { similarity: 0.67, ageDays: 1605, hit3d5pct: false, window: "2017-09-01 - 2017-09-28", maxGain: 0.012, holdDays: 14 }
    ],
    riskNotes: ["短期波动偏大", "估值相对偏高", "宏观不确定性"],
    timeline: [
      { time: "09:31", label: "情绪回暖", type: "emotion", result: "看多" },
      { time: "09:52", label: "放量突破", type: "technical", result: "看多" },
      { time: "10:18", label: "相似形态匹配", type: "similarity", result: "看多" },
      { time: "10:47", label: "资金流入", type: "capital", result: "看多" },
      { time: "13:18", label: "二次确认", type: "technical", result: "看多" },
      { time: "13:45", label: "回踩支撑", type: "risk", result: "观察" },
      { time: "14:22", label: "强势上攻", type: "technical", result: "看多" },
      { time: "14:57", label: "收盘信号", type: "emotion", result: "看多" }
    ]
  },
  {
    code: "002747",
    name: "埃斯顿",
    theme: "机器人",
    sector: "自动化设备",
    concepts: ["工业机器人", "智能制造"],
    latestPrice: 24.82,
    changePct: 4.28,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "23.8 - 26.8",
    snapshotTime,
    emotion: { themeHeat: 98, capitalFlow: 81, breadth: 85, limitUpGene: 79, leaderMomentum: 88 },
    similarCases: Array.from({ length: 18 }, (_, index) => ({
      similarity: 0.89 - (index * 0.015),
      ageDays: 150 + (index * 35),
      hit3d5pct: index % 4 !== 0,
      window: `202${index % 4}-0${(index % 8) + 1}-01 - 202${index % 4}-0${(index % 8) + 1}-18`,
      maxGain: 0.08 + (index * 0.01),
      holdDays: 16 + (index % 4)
    })),
    riskNotes: ["换手率偏高", "追高风险"],
    timeline: []
  },
  {
    code: "300607",
    name: "拓斯达",
    theme: "机器人",
    sector: "自动化设备",
    concepts: ["工业软件", "机器视觉"],
    latestPrice: 31.76,
    changePct: 3.71,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "30.5 - 34.2",
    snapshotTime,
    emotion: { themeHeat: 96, capitalFlow: 79, breadth: 82, limitUpGene: 73, leaderMomentum: 85 },
    similarCases: Array.from({ length: 16 }, (_, index) => ({
      similarity: 0.88 - (index * 0.017),
      ageDays: 180 + (index * 42),
      hit3d5pct: index % 5 !== 0,
      window: `202${index % 5}-0${(index % 7) + 2}-05 - 202${index % 5}-0${(index % 7) + 2}-23`,
      maxGain: 0.07 + (index * 0.009),
      holdDays: 15 + (index % 5)
    })),
    riskNotes: ["盘中波动大"],
    timeline: []
  },
  {
    code: "002527",
    name: "新时达",
    theme: "机器人",
    sector: "电气设备",
    concepts: ["机器人", "伺服系统"],
    latestPrice: 13.57,
    changePct: 2.96,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "12.9 - 14.6",
    snapshotTime,
    emotion: { themeHeat: 92, capitalFlow: 74, breadth: 78, limitUpGene: 71, leaderMomentum: 80 },
    similarCases: Array.from({ length: 14 }, (_, index) => ({
      similarity: 0.84 - (index * 0.016),
      ageDays: 210 + (index * 44),
      hit3d5pct: index % 3 !== 1,
      window: `202${index % 5}-0${(index % 6) + 3}-03 - 202${index % 5}-0${(index % 6) + 3}-20`,
      maxGain: 0.06 + (index * 0.008),
      holdDays: 14 + (index % 4)
    })),
    riskNotes: ["样本量有限"],
    timeline: []
  },
  {
    code: "300124",
    name: "汇川技术",
    theme: "机器人",
    sector: "自动化设备",
    concepts: ["伺服系统", "工控"],
    latestPrice: 59.42,
    changePct: 2.58,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "58.0 - 63.0",
    snapshotTime,
    emotion: { themeHeat: 90, capitalFlow: 77, breadth: 81, limitUpGene: 69, leaderMomentum: 82 },
    similarCases: Array.from({ length: 15 }, (_, index) => ({
      similarity: 0.83 - (index * 0.014),
      ageDays: 320 + (index * 40),
      hit3d5pct: index % 4 !== 1,
      window: `202${index % 3}-0${(index % 6) + 4}-07 - 202${index % 3}-0${(index % 6) + 4}-24`,
      maxGain: 0.05 + (index * 0.007),
      holdDays: 13 + (index % 5)
    })),
    riskNotes: ["弹性弱于前排"],
    timeline: []
  },
  {
    code: "300418",
    name: "昆仑万维",
    theme: "AI应用",
    sector: "互联网服务",
    concepts: ["AIGC", "出海"],
    latestPrice: 42.16,
    changePct: 2.17,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "40.8 - 45.9",
    snapshotTime,
    emotion: { themeHeat: 78, capitalFlow: 73, breadth: 76, limitUpGene: 67, leaderMomentum: 75 },
    similarCases: Array.from({ length: 13 }, (_, index) => ({
      similarity: 0.81 - (index * 0.015),
      ageDays: 250 + (index * 55),
      hit3d5pct: index % 2 === 0,
      window: `202${index % 4}-0${(index % 5) + 4}-10 - 202${index % 4}-0${(index % 5) + 4}-28`,
      maxGain: 0.04 + (index * 0.01),
      holdDays: 14 + (index % 4)
    })),
    riskNotes: ["主题分歧较大"],
    timeline: []
  },
  {
    code: "000977",
    name: "浪潮信息",
    theme: "算力",
    sector: "服务器",
    concepts: ["AI服务器", "液冷"],
    latestPrice: 45.18,
    changePct: 2.86,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "44.0 - 48.6",
    snapshotTime,
    emotion: { themeHeat: 94, capitalFlow: 80, breadth: 84, limitUpGene: 70, leaderMomentum: 86 },
    similarCases: Array.from({ length: 16 }, (_, index) => ({
      similarity: 0.86 - (index * 0.014),
      ageDays: 140 + (index * 46),
      hit3d5pct: index % 4 !== 0,
      window: `202${index % 4}-0${(index % 7) + 1}-04 - 202${index % 4}-0${(index % 7) + 1}-22`,
      maxGain: 0.06 + (index * 0.008),
      holdDays: 15 + (index % 5)
    })),
    riskNotes: ["高位震荡"],
    timeline: []
  },
  {
    code: "300502",
    name: "新易盛",
    theme: "算力",
    sector: "通信设备",
    concepts: ["光模块", "数据中心"],
    latestPrice: 81.44,
    changePct: 3.12,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "79.0 - 86.2",
    snapshotTime,
    emotion: { themeHeat: 93, capitalFlow: 83, breadth: 86, limitUpGene: 74, leaderMomentum: 89 },
    similarCases: Array.from({ length: 17 }, (_, index) => ({
      similarity: 0.88 - (index * 0.013),
      ageDays: 155 + (index * 39),
      hit3d5pct: index % 5 !== 1,
      window: `202${index % 5}-0${(index % 6) + 2}-08 - 202${index % 5}-0${(index % 6) + 2}-24`,
      maxGain: 0.07 + (index * 0.008),
      holdDays: 15 + (index % 4)
    })),
    riskNotes: ["波动斜率偏陡"],
    timeline: []
  },
  {
    code: "002085",
    name: "万丰奥威",
    theme: "低空经济",
    sector: "汽车零部件",
    concepts: ["低空飞行器", "飞行汽车"],
    latestPrice: 18.62,
    changePct: 2.11,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "17.9 - 20.2",
    snapshotTime,
    emotion: { themeHeat: 91, capitalFlow: 72, breadth: 77, limitUpGene: 74, leaderMomentum: 84 },
    similarCases: Array.from({ length: 15 }, (_, index) => ({
      similarity: 0.85 - (index * 0.018),
      ageDays: 200 + (index * 50),
      hit3d5pct: index % 4 !== 2,
      window: `202${index % 4}-0${(index % 6) + 2}-06 - 202${index % 4}-0${(index % 6) + 2}-25`,
      maxGain: 0.07 + (index * 0.009),
      holdDays: 15 + (index % 4)
    })),
    riskNotes: ["分时回撤明显"],
    timeline: []
  },
  {
    code: "000099",
    name: "中信海直",
    theme: "低空经济",
    sector: "航空运输",
    concepts: ["通航", "低空运营"],
    latestPrice: 23.74,
    changePct: 2.67,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "22.8 - 25.6",
    snapshotTime,
    emotion: { themeHeat: 88, capitalFlow: 71, breadth: 75, limitUpGene: 72, leaderMomentum: 83 },
    similarCases: Array.from({ length: 15 }, (_, index) => ({
      similarity: 0.84 - (index * 0.015),
      ageDays: 190 + (index * 47),
      hit3d5pct: index % 4 !== 2,
      window: `202${index % 5}-0${(index % 5) + 3}-06 - 202${index % 5}-0${(index % 5) + 3}-21`,
      maxGain: 0.055 + (index * 0.009),
      holdDays: 14 + (index % 4)
    })),
    riskNotes: ["事件催化依赖高"],
    timeline: []
  },
  {
    code: "300719",
    name: "安达维尔",
    theme: "低空经济",
    sector: "航空装备",
    concepts: ["机载设备", "飞控"],
    latestPrice: 16.33,
    changePct: 2.32,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "15.7 - 17.9",
    snapshotTime,
    emotion: { themeHeat: 86, capitalFlow: 70, breadth: 74, limitUpGene: 69, leaderMomentum: 80 },
    similarCases: Array.from({ length: 14 }, (_, index) => ({
      similarity: 0.82 - (index * 0.015),
      ageDays: 230 + (index * 51),
      hit3d5pct: index % 3 !== 1,
      window: `202${index % 4}-0${(index % 6) + 1}-11 - 202${index % 4}-0${(index % 6) + 1}-27`,
      maxGain: 0.05 + (index * 0.008),
      holdDays: 13 + (index % 5)
    })),
    riskNotes: ["量能持续性待观察"],
    timeline: []
  },
  {
    code: "002371",
    name: "北方华创",
    theme: "半导体设备",
    sector: "半导体",
    concepts: ["刻蚀设备", "晶圆厂"],
    latestPrice: 337.7,
    changePct: 1.64,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "332.0 - 352.0",
    snapshotTime,
    emotion: { themeHeat: 86, capitalFlow: 80, breadth: 79, limitUpGene: 63, leaderMomentum: 78 },
    similarCases: Array.from({ length: 12 }, (_, index) => ({
      similarity: 0.82 - (index * 0.015),
      ageDays: 280 + (index * 48),
      hit3d5pct: index % 3 !== 0,
      window: `202${index % 4}-0${(index % 6) + 1}-09 - 202${index % 4}-0${(index % 6) + 1}-26`,
      maxGain: 0.045 + (index * 0.009),
      holdDays: 16 + (index % 4)
    })),
    riskNotes: ["波动斜率放缓"],
    timeline: []
  },
  {
    code: "300161",
    name: "华中数控",
    theme: "机器人",
    sector: "数控系统",
    concepts: ["工业母机", "自动化"],
    latestPrice: 33.42,
    changePct: 2.18,
    observationWindow: "T+1 开盘至 T+3 收盘",
    targetReturn: 0.05,
    priceRange: "32.0 - 36.1",
    snapshotTime,
    emotion: { themeHeat: 89, capitalFlow: 75, breadth: 80, limitUpGene: 70, leaderMomentum: 81 },
    similarCases: Array.from({ length: 11 }, (_, index) => ({
      similarity: 0.8 - (index * 0.014),
      ageDays: 260 + (index * 52),
      hit3d5pct: index % 2 === 0,
      window: `202${index % 5}-0${(index % 6) + 2}-12 - 202${index % 5}-0${(index % 6) + 2}-30`,
      maxGain: 0.055 + (index * 0.006),
      holdDays: 14 + (index % 3)
    })),
    riskNotes: ["样本量不足，降级展示"],
    timeline: []
  }
];

const themes = [
  { rank: 1, name: "机器人", heat: 98.7, changePct: 3.42, leader: "埃斯顿", leaderCode: "002747" },
  { rank: 2, name: "算力", heat: 95.3, changePct: 2.81, leader: "中际旭创", leaderCode: "300308" },
  { rank: 3, name: "低空经济", heat: 89.6, changePct: 2.35, leader: "万丰奥威", leaderCode: "002085" },
  { rank: 4, name: "半导体设备", heat: 85.1, changePct: 1.98, leader: "北方华创", leaderCode: "002371" },
  { rank: 5, name: "AI应用", heat: 78.4, changePct: 1.76, leader: "昆仑万维", leaderCode: "300418" }
];

function enrichStock(stock) {
  return {
    ...stock,
    probability: computeProbability(stock)
  };
}

function buildDataset() {
  const stockList = stocks.map(enrichStock);
  const stocksByCode = Object.fromEntries(stockList.map((stock) => [stock.code, stock]));
  const rankedSignals = [...stockList].sort(
    (left, right) => right.probability.p_hit_3d_5pct - left.probability.p_hit_3d_5pct
  );
  const themeLeaders = themes.map((theme) => ({
    ...theme,
    leaderStock: stocksByCode[theme.leaderCode]
  }));
  return {
    snapshotTime,
    indices: [
      { name: "上证指数", value: 3147.74, change: -12.12, changePct: -0.38 },
      { name: "深证成指", value: 9532.49, change: -38.45, changePct: -0.4 },
      { name: "创业板指", value: 1832.07, change: -9.64, changePct: -0.52 },
      { name: "沪深300", value: 3627.31, change: -11.8, changePct: -0.32 },
      { name: "成交额", value: 912300000000, display: "9,123 亿", yoy: 6.21 }
    ],
    themes: themeLeaders,
    stocks: stockList,
    rankedSignals,
    featuredSignal: stocksByCode["300308"]
  };
}

export { buildDataset };
