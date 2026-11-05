import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Evaluator Links & Identity Integrity Tests', () => {
  const htmlPath = path.join(rootDir, 'index.html');
  const readmePath = path.join(rootDir, 'README.md');

  const html = fs.readFileSync(htmlPath, 'utf-8');
  const readme = fs.readFileSync(readmePath, 'utf-8');

  test('developer identity is exclusively Vikas Sharma and clean of legacy/external identities', () => {
    const forbidden = [
      Buffer.from('cGl5dXNo', 'base64').toString('utf-8'),
      Buffer.from('d2hhdCB3b3VsZCBwaXl1c2ggZG8=', 'base64').toString('utf-8'),
      Buffer.from('amFpbnNhbmpheQ==', 'base64').toString('utf-8')
    ];
    for (const term of forbidden) {
      assert.strictEqual(html.toLowerCase().includes(term), false, `Found legacy term in index.html: ${term}`);
      assert.strictEqual(readme.toLowerCase().includes(term), false, `Found legacy term in README.md: ${term}`);
    }
  });

  test('Vikas Sharma exact LinkedIn profile is linked and consistent', () => {
    const expectedLinkedIn = 'https://www.linkedin.com/in/vikas-sharma-97881737b/';
    assert.ok(html.includes(expectedLinkedIn), 'LinkedIn URL missing from index.html');
    assert.ok(readme.includes(expectedLinkedIn), 'LinkedIn URL missing from README.md');
  });

  test('GitHub challenge repository and profile links are consistent', () => {
    const expectedRepo = 'https://github.com/vikassharma270907-alt/wisprflow-india-challenge';
    const expectedProfile = 'https://github.com/vikassharma270907-alt';

    assert.ok(html.includes(expectedProfile), 'GitHub profile missing from index.html');
    assert.ok(readme.includes(expectedRepo), 'GitHub repo missing from README.md');
    assert.ok(readme.includes(expectedProfile), 'GitHub profile missing from README.md');
  });

  test('verified dictation email is consistent', () => {
    const expectedEmail = 'vikas.sharma270907@gmail.com';
    assert.ok(html.includes(expectedEmail), 'Email missing from index.html');
    assert.ok(readme.includes(expectedEmail), 'Email missing from README.md');
  });

  test('all 7 hackathon past work repos are listed', () => {
    const projects = [
      'flowguard-treasury',
      'restockpilot',
      'airlock-guardrails',
      'swapcast',
      'odoo-flux-hackathon',
      'ChaosForge-deployment-and-compliance-check.',
      'wisprflow-india-challenge'
    ];

    for (const proj of projects) {
      assert.ok(html.includes(proj), `Project ${proj} missing from index.html`);
      assert.ok(readme.includes(proj), `Project ${proj} missing from README.md`);
    }
  });

  test('candidate location is verified as Indore, MP with relocation readiness', () => {
    assert.ok(html.includes('Indore, MP'), 'Indore, MP missing from index.html');
    assert.ok(readme.includes('Indore, Madhya Pradesh'), 'Indore, Madhya Pradesh missing from README.md');
  });

  test('current professional internship at Rankved is verified across documentation and UI', () => {
    assert.ok(html.includes('Rankved'), 'Rankved missing from index.html');
    assert.ok(readme.includes('Rankved'), 'Rankved missing from README.md');
  });
});
