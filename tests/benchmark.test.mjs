import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BENCHMARK_CASES, getBenchmarkSummary } from '../src/benchmark.mjs';

describe('Hinglish Benchmark Data & Analytics Tests', () => {
  test('benchmark test cases are properly structured', () => {
    assert.ok(BENCHMARK_CASES.length >= 4, 'Insufficient benchmark cases');
    for (const c of BENCHMARK_CASES) {
      assert.ok(c.id, 'Missing ID');
      assert.ok(c.category, 'Missing category');
      assert.ok(c.spoken, 'Missing spoken text');
      assert.ok(c.flowTranscription, 'Missing flow transcription');
      assert.ok(c.gboardTranscription, 'Missing gboard transcription');
      assert.strictEqual(typeof c.flowWinner, 'boolean');
      assert.strictEqual(typeof c.flowWER, 'number');
      assert.strictEqual(typeof c.gboardWER, 'number');
    }
  });

  test('summary metrics show realistic, intellectually honest results', () => {
    const summary = getBenchmarkSummary();
    assert.ok(summary.winRate >= 75, 'Wispr Flow should win majority of Hinglish cases');
    assert.ok(summary.winRate < 100, 'Must include honest failure cases (e.g. Matcha vs Macha)');
    assert.ok(summary.avgFlowWER < summary.avgGboardWER, 'Flow WER must be lower than Gboard');
    assert.ok(summary.werReductionPercent > 50, 'Flow should achieve >50% WER reduction');
  });

  test('urban slang edge case documents Macha vs Matcha fix', () => {
    const edgeCase = BENCHMARK_CASES.find(c => c.spoken.includes('macha'));
    assert.ok(edgeCase, 'Macha edge case must be present');
    assert.strictEqual(edgeCase.flowWinner, false, 'Flow correctly marked false for Macha/Matcha stumble');
    assert.ok(edgeCase.notes.includes('Matcha'), 'Notes must explain the linguistic nuance');
  });
});
