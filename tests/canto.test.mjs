import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cantoPostProcess } from '../src/canto.js';

describe('Canto Voice Processing Engine Tests', () => {
  test('handles empty or whitespace inputs gracefully', () => {
    assert.deepStrictEqual(cantoPostProcess(''), { text: '', fillersCount: 0 });
    assert.deepStrictEqual(cantoPostProcess('   '), { text: '', fillersCount: 0 });
    assert.deepStrictEqual(cantoPostProcess(null), { text: '', fillersCount: 0 });
    assert.deepStrictEqual(cantoPostProcess(undefined), { text: '', fillersCount: 0 });
  });

  test('strips English and Indian slang filler words', () => {
    const input = 'um basically we need to uh ship this matlab right now you know';
    const result = cantoPostProcess(input);
    assert.strictEqual(result.fillersCount, 5);
    assert.strictEqual(result.text, 'We need to ship this right now.');
  });

  test('capitalizes key tech acronyms and Indian fintech rails', () => {
    const input = 'send the pr for the payment api and upi arr tracking';
    const result = cantoPostProcess(input);
    assert.ok(result.text.includes('PR'));
    assert.ok(result.text.includes('API'));
    assert.ok(result.text.includes('UPI'));
    assert.ok(result.text.includes('ARR'));
  });

  test('capitalizes leadership and brand names', () => {
    const input = 'wispr flow was founded by tanay and ariye with nimisha leading india';
    const result = cantoPostProcess(input);
    assert.ok(result.text.includes('Wispr Flow'));
    assert.ok(result.text.includes('Tanay'));
    assert.ok(result.text.includes('Nimisha'));
  });

  test('resolves mid-sentence course corrections', () => {
    const input = 'meeting at Indiranagar actually Koramangala tomorrow morning';
    const result = cantoPostProcess(input);
    assert.ok(!result.text.includes('Indiranagar'));
    assert.ok(result.text.includes('Koramangala'));
  });

  test('respects toggle disabling filler stripping', () => {
    const input = 'um this is test';
    const result = cantoPostProcess(input, { filterFillers: false });
    assert.strictEqual(result.fillersCount, 0);
    assert.ok(result.text.toLowerCase().includes('um'));
  });

  test('formats sentences with clean punctuation', () => {
    const input = 'hello world';
    const result = cantoPostProcess(input);
    assert.strictEqual(result.text, 'Hello world.');
  });
});
