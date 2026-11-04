import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFunnel } from '../src/funnel.js';

describe('Funnel Conversion Engine Tests', () => {
  test('default parameters produce expected baseline uplift', () => {
    const result = calculateFunnel();
    // Default: cap=2000 (+0.7), eliminate bonus (+1.4), cap-upi trigger (+1.5), student (+0.4)
    // Base 2.1 + 0.7 + 1.4 + 1.5 + 0.4 = 6.1%
    assert.strictEqual(result.rate, 6.1);
    assert.strictEqual(result.rateFormatted, '6.1%');
    assert.strictEqual(result.lift, 190);
    assert.strictEqual(result.payingUsers, 6100);
    assert.strictEqual(result.crores, 2.34);
    assert.strictEqual(result.arrFormatted, '₹2.34 Cr');
  });

  test('maximum throttle with 1000 cap boosts conversion rate', () => {
    const result = calculateFunnel({
      cap: 1000,
      trigger: 'cap-upi',
      bonusState: 'eliminate',
      studentOn: true
    });
    // Base 2.1 + 1.4 (cap 1000) + 1.4 + 1.5 + 0.4 = 6.8%
    assert.strictEqual(result.rate, 6.8);
    assert.strictEqual(result.payingUsers, 6800);
    assert.strictEqual(result.arrFormatted, '₹2.61 Cr');
  });

  test('reduced bonus and styles-gate trigger branch testing', () => {
    const result = calculateFunnel({
      cap: 3000,
      trigger: 'styles-gate',
      bonusState: 'reduce',
      studentOn: false
    });
    // Base 2.1 + 0 (cap 3000) + 1.1 (reduce) + 0.9 (styles-gate) + 0 (student off) = 4.1%
    assert.strictEqual(result.rate, 4.1);
    assert.strictEqual(result.rateFormatted, '4.1%');
    assert.strictEqual(result.payingUsers, 4100);
  });

  test('loose policy with high cap and free bonuses drops conversion', () => {
    const result = calculateFunnel({
      cap: 5000,
      trigger: 'standard',
      bonusState: 'keep',
      studentOn: false
    });
    // Base 2.1 - 1.4 (cap 5000) - 0.5 (keep bonus) + 0 + 0 = 0.2% -> clamped to 1.0% min
    assert.strictEqual(result.rate, 1.0);
    assert.strictEqual(result.rateFormatted, '1.0%');
    assert.strictEqual(result.payingUsers, 1000);
    assert.strictEqual(result.arrFormatted, '₹0.38 Cr');
  });

  test('clamps maximum rate to 8.5%', () => {
    // Artificial ultra-high scenario
    const result = calculateFunnel({
      cap: 0,
      trigger: 'cap-upi',
      bonusState: 'eliminate',
      studentOn: true
    });
    assert.ok(result.rate <= 8.5);
  });

  test('paying user and ARR calculations are proportional to MAU', () => {
    const res50k = calculateFunnel({ baseUsers: 50000 });
    const res100k = calculateFunnel({ baseUsers: 100000 });
    assert.strictEqual(res50k.payingUsers * 2, res100k.payingUsers);
    assert.strictEqual(res50k.annualRevINR * 2, res100k.annualRevINR);
  });
});
