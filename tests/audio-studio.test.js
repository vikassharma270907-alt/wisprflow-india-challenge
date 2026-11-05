const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const HTML_PATH = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

describe('Live Audio Studio & Dictation Hardware Pipeline Tests', () => {
  test('live audio VU meter and acoustic decibel elements exist in DOM', () => {
    assert(/id=["']micVuBar["']/.test(html), 'Missing #micVuBar acoustic volume level element');
    assert(/id=["']micDbLevel["']/.test(html), 'Missing #micDbLevel decibel display element');
    assert(/ACOUSTIC INPUT/.test(html), 'Missing acoustic input hardware label');
  });

  test('interactive 1-click sample voice dictation simulation buttons are present', () => {
    assert(/simulateVoiceDictation\(['"]tech['"]\)/.test(html), 'Missing Play Sample Hinglish Voice Input button');
    assert(/simulateVoiceDictation\(['"]traffic['"]\)/.test(html), 'Missing Bangalore Traffic Acoustic Stream simulation button');
  });

  test('SpeechRecognition and getUserMedia audio pipelines are implemented', () => {
    assert(/navigator\.mediaDevices\.getUserMedia/.test(html), 'Missing getUserMedia microphone permission request');
    assert(/createAnalyser\(\)/.test(html), 'Missing Web Audio API AnalyserNode for real-time VU meter');
    assert(/function simulateVoiceDictation\(/.test(html), 'Missing simulateVoiceDictation function definition');
    assert(/function startDictation\(/.test(html), 'Missing startDictation function definition');
    assert(/function stopDictation\(/.test(html), 'Missing stopDictation function definition');
  });

  test('Spacebar hotkey listener is cleanly debounced without duplicates', () => {
    const spacebarMatches = html.match(/e\.code\s*===\s*['"]Space['"]/g) || [];
    assert.strictEqual(spacebarMatches.length, 1, 'Expected exactly 1 spacebar hotkey listener to prevent instant toggling');
    assert(/!e\.repeat/.test(html), 'Spacebar listener must check !e.repeat to debounce rapid presses');
  });

  test('error handling does not overwrite error notices with false success message', () => {
    assert(/lastDictationError/.test(html), 'Dictation engine must maintain lastDictationError state');
    assert(/stopDictation\(true\)/.test(html), 'onerror handler must notify stopDictation of error status');
    assert(/escapeHtml\(lastDictationError\)/.test(html), 'Error notice must safely display escaped error message');
  });
});
