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

  test('external links include rel="noopener noreferrer" for reverse tabnabbing defense', () => {
    // Links with target="_blank" must include rel="noopener noreferrer"
    const targetBlankRegex = /<a\s+[^>]*target="_blank"[^>]*>/gi;
    const matches = html.match(targetBlankRegex) || [];
    assert.ok(matches.length > 0, 'No external target="_blank" links found');

    for (const match of matches) {
      const hasRel = /rel=["'][^"']*(noreferrer|noopener)[^"']*["']/i.test(match);
      assert.ok(hasRel, `Link missing rel attribute: ${match}`);
      assert.ok(match.includes('rel="noopener noreferrer"'), `Link missing full rel="noopener noreferrer": ${match}`);
    }
  });

  test('input fields do not perform unsafe evaluation', () => {
    // No eval() calls in client scripts
    assert.strictEqual(/\beval\s*\(/.test(html), false, 'Dangerous eval() found in index.html');
    assert.strictEqual(/document\.write\s*\(/.test(html), false, 'Dangerous document.write() found in index.html');
  });

  test('vercel.json enforces complete suite of HTTP security headers including CSP', () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf-8'));
    const headers = vercel.headers[0].headers;
    const headerMap = Object.fromEntries(headers.map(h => [h.key.toLowerCase(), h.value]));

    assert.ok(headerMap['content-security-policy'], 'Missing Content-Security-Policy header in vercel.json');
    assert.ok(headerMap['content-security-policy'].includes("object-src 'none'"), 'CSP must enforce object-src none');
    assert.ok(headerMap['content-security-policy'].includes("frame-ancestors 'none'"), 'CSP must enforce frame-ancestors none');
    assert.ok(headerMap['strict-transport-security'], 'Missing Strict-Transport-Security header in vercel.json');
    assert.strictEqual(headerMap['x-content-type-options'], 'nosniff', 'Missing or invalid X-Content-Type-Options');
    assert.strictEqual(headerMap['x-frame-options'], 'DENY', 'Missing or invalid X-Frame-Options');
    assert.ok(headerMap['referrer-policy'], 'Missing Referrer-Policy header');
    assert.ok(headerMap['permissions-policy'], 'Missing Permissions-Policy header');
  });
});
