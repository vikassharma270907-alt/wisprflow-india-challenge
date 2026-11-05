const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { parseTerminalCommand, validateTelemetry } = require('../src/engine');

describe('Wispr CLI Terminal Engine & Telemetry Verification', () => {
  test('help command returns full list of available diagnostic routines', () => {
    const res = parseTerminalCommand('help');
    assert.equal(res.status, 'ok');
    assert.equal(res.command, 'help');
    assert(Array.isArray(res.available));
    assert(res.available.includes('status'));
    assert(res.available.includes('simulate'));
    assert(res.available.includes('benchmark'));
    assert(res.available.includes('rig'));
    assert(res.available.includes('canto'));
  });

  test('status command returns verified Wispr Flow telemetry matching candidate claims', () => {
    const res = parseTerminalCommand('status');
    assert.equal(res.status, 'ok');
    assert.equal(res.telemetry.wordsDictated, 8420);
    assert.equal(res.telemetry.wpm, 162);
    assert.equal(res.telemetry.cantoWer, 10.2);
    assert.equal(res.telemetry.latencyMs, 210);

    const validation = validateTelemetry({
      words: res.telemetry.wordsDictated,
      wpm: res.telemetry.wpm,
      wer: res.telemetry.cantoWer,
      latencyMs: res.telemetry.latencyMs
    });
    assert.equal(validation.valid, true);
  });

  test('simulate command outputs conversion projection and ARR in Crores', () => {
    const res = parseTerminalCommand('simulate');
    assert.equal(res.status, 'ok');
    assert.equal(res.projectedConversion, 5.8);
    assert.equal(res.conversionLift, '+2.76x');
    assert(res.projectedArrInr.includes('Crore'));
  });

  test('rig command outputs exact $3,000 grant distribution', () => {
    const res = parseTerminalCommand('rig');
    assert.equal(res.status, 'ok');
    assert.equal(res.totalGrant, 3000);
    const totalAllocated = res.breakdown.reduce((sum, item) => sum + item.amount, 0);
    assert.equal(totalAllocated, 3000, 'All $3,000 must be accounted for');
  });

  test('whoami command returns candidate identity and contact verified credentials', () => {
    const res = parseTerminalCommand('whoami');
    assert.equal(res.status, 'ok');
    assert.equal(res.candidate, 'Vikas Sharma');
    assert.equal(res.location, 'Indore, MP, India');
    assert(res.verifiedWords >= 8400);
  });

  test('handles case-insensitivity, leading/trailing whitespace, and unknown commands', () => {
    const upper = parseTerminalCommand('  STATUS  ');
    assert.equal(upper.status, 'ok');
    assert.equal(upper.command, 'status');

    const unknown = parseTerminalCommand('invalid_command_xyz');
    assert.equal(unknown.status, 'error');
    assert(unknown.message.includes('Command not found'));
  });

  test('telemetry validation rejects fabricated or sub-threshold metrics', () => {
    // Below 5,000 words
    const lowWords = validateTelemetry({ words: 1200, wpm: 150, wer: 10, latencyMs: 200 });
    assert.equal(lowWords.valid, false);

    // Unrealistic WPM (>250)
    const highWpm = validateTelemetry({ words: 8000, wpm: 400, wer: 10, latencyMs: 200 });
    assert.equal(highWpm.valid, false);

    // Latency above 700ms hard ceiling
    const highLatency = validateTelemetry({ words: 8000, wpm: 150, wer: 10, latencyMs: 850 });
    assert.equal(highLatency.valid, false);
  });
});
