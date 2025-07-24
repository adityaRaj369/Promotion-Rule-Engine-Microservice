
let metrics = {
  totalEvaluations: 0,
  hits: { A: 0, B: 0 },
  misses: { A: 0, B: 0 },
  latencies: []
};

// Records the evaluation metrics.
// It tracks total evaluations, hits, misses, and latencies for performance analysis.
const recordEvaluation = (startTime, hasPromotion, abBucket) => {
  metrics.totalEvaluations++;
  if (hasPromotion) {
    metrics.hits[abBucket]++;
  } else {
    metrics.misses[abBucket]++;
  }
  const latency = Date.now() - startTime;
  metrics.latencies.push(latency);
};


// Returns the evaluation metrics.
// It provides stats like total evaluations, hits, misses, and average latency.
const getMetrics = () => {
  const averageLatency = metrics.latencies.length 
    ? (metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length).toFixed(2) 
    : 0;
  return {
    totalEvaluations: metrics.totalEvaluations,
    hits: metrics.hits,
    misses: metrics.misses,
    averageLatency: parseFloat(averageLatency)
  };
};

// Resets the metrics for a fresh start.
// This can be useful for testing or when starting a new evaluation cycle.
const resetMetrics = () => {
  metrics = {
    totalEvaluations: 0,
    hits: { A: 0, B: 0 },
    misses: { A: 0, B: 0 },
    latencies: []
  };
};

module.exports = { recordEvaluation, getMetrics, resetMetrics };