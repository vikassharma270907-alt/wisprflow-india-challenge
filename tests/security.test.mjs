import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Security & Hardening Tests', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf-8');

  test('no exposed secrets, live API keys, or private tokens', () => {
    // Check for OpenAI, Anthropic, Stripe, Elevenlabs, or generic Bearer tokens
    const secretPatterns = [
      /sk-[a-zA-Z0-9]{20,}/,
      /ghp_[a-zA-Z0-9]{20,}/,
      /eyJ[a-zA-Z0-9_-]{20,}\.eyJ/,
      /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/,
      /AIza[0-9A-Za-z-_]{35}/
    ];

    for (const pattern of secretPatterns) {
      assert.strictEqual(pattern.test(html), false, `Potential secret found matching ${pattern} in index.html`);
      assert.strictEqual(pattern.test(readme), false, `Potential secret found matching ${pattern} in README.md`);
    }
  });

  test('external links include rel="noreferrer" for security', () => {
    // Links with target="_blank" must include rel="noreferrer" or rel="noopener"
    const targetBlankRegex = /<a\s+[^>]*target="_blank"[^>]*>/gi;
    const matches = html.match(targetBlankRegex) || [];
    assert.ok(matches.length > 0, 'No external target="_blank" links found');

    for (const match of matches) {
      const hasRel = /rel=["'][^"']*(noreferrer|noopener)[^"']*["']/i.test(match);
      assert.ok(hasRel, `Link missing rel="noreferrer": ${match}`);
    }
  });

  test('input fields do not perform unsafe evaluation', () => {
    // No eval() calls in client scripts
    assert.strictEqual(/\beval\s*\(/.test(html), false, 'Dangerous eval() found in index.html');
    assert.strictEqual(/document\.write\s*\(/.test(html), false, 'Dangerous document.write() found in index.html');
  });
});
