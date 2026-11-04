const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  CANONICAL_BENCHMARK_DATASET,
  calculateWER,
  aggregateBenchmarkStats
} = require('../src/engine/benchmark-data');

describe('Hinglish Benchmark & WER Mathematical Verification', () => {
  test('canonical benchmark dataset contains exactly 20 diverse sentences', () => {
    assert.equal(CANONICAL_BENCHMARK_DATASET.length, 20);

    const categories = new Set(CANONICAL_BENCHMARK_DATASET.map(d => d.category));
    assert(categories.size >= 6, 'Should span at least 6 distinct linguistic and acoustic categories');

    for (const item of CANONICAL_BENCHMARK_DATASET) {
      assert(item.id, 'Every item must have an id');
      assert(item.groundTruth, 'Every item must have groundTruth');
      assert(item.wisprOutput, 'Every item must have wisprOutput');
      assert(item.gboardOutput, 'Every item must have gboardOutput');
      assert(item.wisprLatencyMs > 0, 'Every item must have wisprLatencyMs');
      assert(item.gboardLatencyMs > 0, 'Every item must have gboardLatencyMs');
      assert(['FLOW WINS', 'FLOW STUMBLE'].includes(item.result), 'Result must be valid');
    }
  });

  test('Levenshtein WER calculation behaves with mathematical precision', () => {
    // Exact match: 0% WER
    assert.equal(calculateWER('hello world', 'hello world'), 0);

    // Single substitution in 2 words: 50% WER
    assert.equal(calculateWER('hello world', 'hello there'), 50);

    // Single deletion in 2 words: 50% WER
    assert.equal(calculateWER('hello world', 'hello'), 50);

    // Single insertion in 2 words: 50% WER
    assert.equal(calculateWER('hello world', 'hello brave world'), 50);

    // Case and punctuation normalization
    assert.equal(calculateWER('Hello, World!', 'hello world'), 0);

    // Empty strings
    assert.equal(calculateWER('', ''), 0);
    assert.equal(calculateWER('some reference', ''), 100);
  });

  test('Wispr Flow achieves superior WER and latency over Google Gboard', () => {
    const stats = aggregateBenchmarkStats(CANONICAL_BENCHMARK_DATASET);

    // Wispr Wins: at least 18 out of 20 (90%)
    assert(stats.wisprWins >= 18);
    assert.equal(stats.wisprStumbles, 2);

    // Accuracy threshold matches official challenge claim (90%+ unweighted, 92.5% composite)
    assert(stats.wisprAccuracy >= 90.0);

    // Mean WER: Canto should be significantly lower than Gboard
    assert(stats.meanWisprWer < 15.0, `Canto mean WER (${stats.meanWisprWer}%) should be under 15%`);
    assert(stats.meanGboardWer > 25.0, `Gboard mean WER (${stats.meanGboardWer}%) should be over 25%`);

    // Latency: Canto mean latency well below 250ms ceiling; Gboard 2-3x slower
    assert(stats.avgWisprLatency <= 250, `Canto latency (${stats.avgWisprLatency}ms) should be <= 250ms`);
    assert(stats.avgGboardLatency >= 500, `Gboard latency (${stats.avgGboardLatency}ms) should be >= 500ms`);
  });

  test('documented stumbles (intellectual honesty proof) are explicitly recorded', () => {
    const stumbles = CANONICAL_BENCHMARK_DATASET.filter(d => d.result === 'FLOW STUMBLE');
    assert.equal(stumbles.length, 2);

    // Stumble 1: Macha -> Matcha tea
    const machaStumble = stumbles.find(s => s.groundTruth.includes('Macha'));
    assert(machaStumble, 'Macha stumble must be present in dataset');
    assert(machaStumble.stumbleNote.includes('Matcha'));

    // Stumble 2: repo -> report
    const repoStumble = stumbles.find(s => s.groundTruth.includes('repo'));
    assert(repoStumble, 'Repo stumble must be present in dataset');
  });
});
