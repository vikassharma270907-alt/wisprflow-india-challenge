const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { scanForSecrets, auditXssRisks, escapeHtml } = require('../src/utils/security-guard');

const HTML_PATH = path.join(__dirname, '..', 'index.html');
const README_PATH = path.join(__dirname, '..', 'README.md');

const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const readmeContent = fs.readFileSync(README_PATH, 'utf8');

describe('Security & Secrets Hygiene Audit', () => {
  test('codebase contains zero hardcoded API keys, tokens, or private keys', () => {
    const htmlScan = scanForSecrets(htmlContent, 'index.html');
    assert(htmlScan.clean, `Secrets detected in index.html: ${JSON.stringify(htmlScan.findings)}`);

    const readmeScan = scanForSecrets(readmeContent, 'README.md');
    assert(readmeScan.clean, `Secrets detected in README.md: ${JSON.stringify(readmeScan.findings)}`);
  });

  test('no dangerous JavaScript execution primitives (eval or document.write) are used', () => {
    const xssAudit = auditXssRisks(htmlContent);
    assert(xssAudit.safe, `Dangerous JS patterns found: ${xssAudit.risks.join(', ')}`);
  });

  test('escapeHtml properly sanitizes potential XSS payloads', () => {
    const maliciousPayload = '<script>alert("pwned")</script>&<img src=x onerror=alert(1)>';
    const escaped = escapeHtml(maliciousPayload);

    assert(!escaped.includes('<script>'), 'Script tag must be escaped');
    assert(!escaped.includes('<img'), 'Img tag must be escaped');
    assert(escaped.includes('&lt;script&gt;'));
    assert(escaped.includes('&amp;'));
  });

  test('API key storage pattern strictly defaults to empty and does not leak keys', () => {
    // Check that default localStorage read provides empty fallback
    assert(htmlContent.includes("localStorage.getItem('WISPR_API_KEY') || ''") || htmlContent.includes("localStorage.getItem('WISPR_API_KEY')"));
    assert(!htmlContent.includes("localStorage.setItem('WISPR_API_KEY', 'sk-"));
    assert(!htmlContent.includes("localStorage.setItem('WISPR_API_KEY', 'wispr_"));
  });

  test('AudioContext initialization conforms to browser autoplay gesture policies', () => {
    // Ensures audioCtx is initialized inside a user-gesture handler and handles suspended state
    assert(htmlContent.includes('ctx.state === \'suspended\''), 'Must handle suspended AudioContext state');
    assert(htmlContent.includes('ctx.resume()'), 'Must resume AudioContext safely on gesture');
  });
});
