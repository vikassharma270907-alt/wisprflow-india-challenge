import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

describe('Deep Linking & Profile Discoverability Tests', () => {
  test('URL hash routing and hashchange listener are implemented in index.html', () => {
    assert.ok(html.includes('function handleUrlRouting('), 'Missing handleUrlRouting function');
    assert.ok(html.includes("window.addEventListener('hashchange'"), 'Missing hashchange listener');
    assert.ok(/\[['"]profile['"],\s*['"]operator['"]/.test(html), 'Missing profile route aliases');
    assert.ok(/\[['"]projects['"],\s*['"]pastwork['"]/.test(html), 'Missing past work route aliases');
  });

  test('Desktop top bar contains prominent direct buttons for Profile and Past Work', () => {
    assert.ok(/onclick=["']openWindow\(['"]operator['"]\);\s*bringToFront\(['"]operator['"]\);?["']/.test(html),
      'Missing Desktop top bar Profile button');
    assert.ok(/onclick=["']openWindow\(['"]projects['"]\);\s*bringToFront\(['"]projects['"]\);?["']/.test(html),
      'Missing Desktop top bar Past Work button');
    assert.ok(html.includes('Rankved Intern'), 'Missing Rankved Intern callout in top bar');
  });

  test('Desktop workspace contains floating candidate discovery dock', () => {
    assert.ok(html.includes('Candidate: <strong class="text-white">Vikas Sharma</strong>'),
      'Missing Candidate name in discovery dock');
    assert.ok(html.includes('openWindow(\'operator\')'), 'Missing operator launcher in discovery dock');
    assert.ok(html.includes('openWindow(\'projects\')'), 'Missing projects launcher in discovery dock');
    assert.ok(html.includes('setMode(\'executive\', \'operator\')'), 'Missing webpage mode toggle in discovery dock');
  });

  test('Executive header contains direct Profile and Past Work quick jump buttons', () => {
    assert.ok(/onclick=["']switchTab\(['"]operator['"]\)["'].*?Profile/s.test(html),
      'Missing Executive header Profile button');
    assert.ok(/onclick=["']switchTab\(['"]projects['"]\)["'].*?Past Work/s.test(html),
      'Missing Executive header Past Work button');
  });

  test('Start Menu and Flowy widget provide direct paths to Profile and Past Work', () => {
    assert.ok(/openWindow\(['"]operator['"]\).*?My Profile \(Rankved\)/s.test(html),
      'Missing Profile in Start Menu');
    assert.ok(/openWindow\(['"]projects['"]\).*?Past Work \(GitHub\)/s.test(html),
      'Missing Past Work in Start Menu');
    assert.ok(/openWindow\(['"]operator['"]\).*?Vikas Sharma Profile/s.test(html),
      'Missing Profile in Flowy widget');
    assert.ok(/openWindow\(['"]projects['"]\).*?Past Work &amp; GitHub/s.test(html),
      'Missing Past Work in Flowy widget');
  });

  test('Executive video walkthrough and standalone narration audio are embedded with valid sources', () => {
    assert.ok(html.includes('id="executive-playbook-video"'), 'Missing executive video player in Master Playbook');
    assert.ok(html.includes('id="walkthroughVideoPlayer"'), 'Missing video player in Walkthrough section');
    assert.ok(html.includes('id="narrationAudioPlayer"'), 'Missing standalone audio player in Walkthrough section');
    assert.ok(html.includes('flowstate_india_walkthrough.mp4'), 'Missing flowstate_india_walkthrough.mp4 reference');
    assert.ok(html.includes('flowstate_india_narration.mp3'), 'Missing flowstate_india_narration.mp3 reference');
    assert.ok(/id=["']tab-walkthrough["']/.test(html), 'Missing sub-nav Tab 11 for Video Walkthrough');
    assert.ok(/\[['"]walkthrough['"],\s*['"]video['"]/.test(html), 'Missing walkthrough/video route aliases in handleUrlRouting');
  });
});
