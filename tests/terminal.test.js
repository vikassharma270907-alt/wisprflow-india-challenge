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
    assert(res.available.includes('plan'));
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

  test('plan and rig commands output exact $3,000 Growth-Tech Plan distribution', () => {
    for (const cmd of ['plan', 'rig']) {
      const res = parseTerminalCommand(cmd);
      assert.equal(res.status, 'ok');
      assert.equal(res.totalGrant, 3000);
      assert.equal(res.section, 'The $3,000 Growth-Tech Plan');
      assert.equal(res.subtitle, 'Challenge budget in USD');
      assert.equal(res.breakdown.length, 6);

      const totalAllocated = res.breakdown.reduce((sum, item) => sum + item.amount, 0);
      assert.equal(totalAllocated, 3000, 'All $3,000 must be accounted for');

      assert.equal(res.breakdown[0].name, 'Hinglish Test Lab');
      assert.equal(res.breakdown[0].amount, 750);
      assert.equal(res.breakdown[0].share, '25.0%');

      assert.equal(res.breakdown[1].name, 'Paywall Experiments');
      assert.equal(res.breakdown[1].amount, 600);
      assert.equal(res.breakdown[1].share, '20.0%');

      assert.equal(res.breakdown[2].name, 'Mobile-to-Desktop Handoff');
      assert.equal(res.breakdown[2].amount, 550);
      assert.equal(res.breakdown[2].share, '18.3%');

      assert.equal(res.breakdown[3].name, '"Report a Mishear" Bounties');
      assert.equal(res.breakdown[3].amount, 600);
      assert.equal(res.breakdown[3].share, '20.0%');

      assert.equal(res.breakdown[4].name, 'Referral Engine');
      assert.equal(res.breakdown[4].amount, 350);
      assert.equal(res.breakdown[4].share, '11.7%');

      assert.equal(res.breakdown[5].name, 'Hosting and API Costs');
      assert.equal(res.breakdown[5].amount, 150);
      assert.equal(res.breakdown[5].share, '5.0%');

      assert.equal(res.whatWellMeasure.length, 4);
      assert(res.whatWellMeasure.includes('Desktop activation rate'));
      assert(res.whatWellMeasure.includes('Trial-to-paid conversion at each paywall trigger'));
      assert(res.whatWellMeasure.includes('Hinglish error rate vs Gboard'));
      assert(res.whatWellMeasure.includes('Cost per referred install'));
    }
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

    const nullCmd = parseTerminalCommand(null);
    assert.equal(nullCmd.status, 'error');
    assert.equal(nullCmd.message, 'Invalid command input: string expected');

    const emptyCmd = parseTerminalCommand('');
    assert.equal(emptyCmd.status, 'error');
    assert.equal(emptyCmd.message, 'Invalid command input: string expected');
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
