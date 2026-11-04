const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const HTML_PATH = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

describe('DOM & Navigation Architecture Verification', () => {
  const TABS = [
    'funnel',
    'benchmark',
    'dashboard',
    'grant',
    'operator',
    'studio',
    'audio',
    'terminal',
    'playbook',
    'projects'
  ];

  test('all 10 navigation tab buttons are defined with proper onclick handlers', () => {
    for (const tab of TABS) {
      const buttonPattern = new RegExp(`id=["']tab-${tab}["']`, 'i');
      const clickPattern = new RegExp(`onclick=["']switchTab\\(['"]${tab}['"]\\)["']`, 'i');

      assert(buttonPattern.test(html), `Missing button #tab-${tab} in index.html`);
      assert(clickPattern.test(html), `Missing switchTab('${tab}') onclick handler for #tab-${tab}`);
    }
  });

  test('all 10 tab content containers are defined with correct semantic classes', () => {
    for (const tab of TABS) {
      const contentPattern = new RegExp(`id=["']content-${tab}["'][^>]*class=["'][^"']*tab-content`, 'i');
      assert(contentPattern.test(html), `Missing or invalid #content-${tab} tab-content container`);
    }
  });

  test('simulator interactive controls are present and wired to updateSimulator', () => {
    assert(/id=["']capSlider["']/.test(html), 'Missing #capSlider input range');
    assert(/id=["']triggerSelect["']/.test(html), 'Missing #triggerSelect dropdown');
    assert(/id=["']studentCheck["']/.test(html), 'Missing #studentCheck checkbox');
    assert(/id=["']projectedConv["']/.test(html), 'Missing #projectedConv display element');
    assert(/id=["']convLift["']/.test(html), 'Missing #convLift display element');
    assert(/id=["']projectedARR["']/.test(html), 'Missing #projectedARR display element');
    assert(/id=["']capDisplay["']/.test(html), 'Missing #capDisplay display element');
    assert(/oninput=["']updateSimulator\(\)["']/.test(html), 'Slider must call updateSimulator on input');
  });

  test('live Canto dictation studio elements are fully defined', () => {
    assert(/id=["']micBtn["']/.test(html), 'Missing #micBtn dictation toggle button');
    assert(/id=["']rawTranscript["']/.test(html), 'Missing #rawTranscript container');
    assert(/id=["']cantoTranscript["']/.test(html), 'Missing #cantoTranscript container');
    assert(/id=["']fillersCount["']/.test(html), 'Missing #fillersCount metric');
    assert(/id=["']latencyDisplay["']/.test(html), 'Missing #latencyDisplay metric');
    assert(/id=["']filterFillers["']/.test(html), 'Missing #filterFillers toggle');
    assert(/id=["']filterAcronyms["']/.test(html), 'Missing #filterAcronyms toggle');
    assert(/id=["']filterCourseCorrect["']/.test(html), 'Missing #filterCourseCorrect toggle');
  });

  test('FlowOS window management architecture is declared for all workspaces', () => {
    const WINDOWS = ['funnel', 'benchmark', 'dashboard', 'grant', 'operator', 'studio', 'audio', 'terminal', 'playbook', 'sweeper'];
    for (const win of WINDOWS) {
      assert(new RegExp(`id=["']win-${win}["']`, 'i').test(html), `Missing desktop window #win-${win}`);
    }

    assert(/function openWindow\(/.test(html), 'Missing openWindow function');
    assert(/function closeWindow\(/.test(html), 'Missing closeWindow function');
    assert(/function minimizeWindow\(/.test(html), 'Missing minimizeWindow function');
    assert(/function maximizeWindow\(/.test(html), 'Missing maximizeWindow function');
    assert(/function bringToFront\(/.test(html), 'Missing bringToFront function');
  });

  test('X-Ray mode infrastructure and telemetry prompt badges exist', () => {
    assert(/function toggleXRay\(/.test(html), 'Missing toggleXRay function');
    assert(/xray-badge/.test(html), 'Missing xray-badge class declarations');
    assert(/xray-glow/.test(html), 'Missing xray-glow class declarations');
    assert(/RAW VOICE PROMPT DICTATED INTO WISPR FLOW/.test(html), 'Missing raw voice prompt telemetry callout');
  });

  test('Wispr CLI Terminal console contains required command input and output targets', () => {
    assert(/id=["']terminalInput["']/.test(html), 'Missing #terminalInput');
    assert(/id=["']terminalOutput["']/.test(html), 'Missing #terminalOutput');
    assert(/function executeTerminalCommand\(/.test(html), 'Missing executeTerminalCommand function');
  });

  test('viewport, character encoding, title, and CDN assets are properly specified', () => {
    assert(/<meta\s+charset=["']UTF-8["']/i.test(html), 'Missing UTF-8 charset');
    assert(/<meta\s+name=["']viewport["']/i.test(html), 'Missing viewport meta tag');
    assert(/<title>FlowState India/i.test(html), 'Missing proper page title');
    assert(/cdn\.tailwindcss\.com/.test(html), 'Must include Tailwind CDN');
    assert(/unpkg\.com\/lucide/.test(html), 'Must include Lucide icons CDN');
  });
});
