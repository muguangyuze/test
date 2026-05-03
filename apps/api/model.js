const MODEL_VERSION = "chaos-mvp-2026-05-03";
const CALIBRATION_VERSION = "beta-binomial-v1";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function weightedAverage(entries) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (!totalWeight) {
    return 0;
  }
  const score = entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0);
  return score / totalWeight;
}

function scoreEmotion(stock) {
  const entries = [
    { weight: 0.28, value: stock.emotion.themeHeat / 100 },
    { weight: 0.18, value: stock.emotion.capitalFlow / 100 },
    { weight: 0.18, value: stock.emotion.breadth / 100 },
    { weight: 0.18, value: stock.emotion.limitUpGene / 100 },
    { weight: 0.18, value: stock.emotion.leaderMomentum / 100 }
  ];
  return round(weightedAverage(entries), 4);
}

function scoreSimilarity(stock) {
  const weightedMatches = stock.similarCases.map((item) => {
    const agePenalty = Math.exp(-item.ageDays / 540);
    const weight = (item.similarity ** 3) * agePenalty;
    return {
      weight,
      hit: item.hit3d5pct ? 1 : 0
    };
  });
  const totalWeight = weightedMatches.reduce((sum, item) => sum + item.weight, 0);
  const hitWeight = weightedMatches.reduce((sum, item) => sum + (item.hit * item.weight), 0);
  return round(totalWeight ? hitWeight / totalWeight : 0, 4);
}

function computeProbability(stock) {
  const emotionScore = scoreEmotion(stock);
  const similarityScore = scoreSimilarity(stock);
  const sampleSize = stock.similarCases.length;
  const priorMean = 0.38;
  const priorStrength = 18;
  const empiricalHits = stock.similarCases.filter((item) => item.hit3d5pct).length;
  const posterior = (empiricalHits + priorMean * priorStrength) / (sampleSize + priorStrength);
  const combined = clamp((emotionScore * 0.4) + (similarityScore * 0.6), 0.05, 0.95);
  const calibrated = clamp((combined * 0.65) + (posterior * 0.35), 0.05, 0.95);
  const degraded = sampleSize < 12;
  return {
    p_hit_3d_5pct: round(calibrated, 4),
    p_up_3d: round(calibrated, 4),
    p_close_up_today: round(clamp((emotionScore * 0.55) + 0.18, 0.05, 0.92), 4),
    sample_size: sampleSize,
    snapshot_time: stock.snapshotTime,
    model_version: MODEL_VERSION,
    calibration_version: CALIBRATION_VERSION,
    degraded,
    label: degraded ? "参考信号" : "历史条件概率估计",
    factor_breakdown: {
      emotion_score: round(emotionScore, 4),
      similarity_score: round(similarityScore, 4),
      weights: {
        emotion: 0.4,
        similarity: 0.6
      }
    }
  };
}

export {
  CALIBRATION_VERSION,
  MODEL_VERSION,
  computeProbability
};
