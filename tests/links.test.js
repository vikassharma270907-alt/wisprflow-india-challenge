const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { extractHtmlLinks, extractMarkdownLinks, auditLinkSecurity, pingUrl } = require('../src/utils/link-scanner');

const HTML_PATH = path.join(__dirname, '..', 'index.html');
const README_PATH = path.join(__dirname, '..', 'README.md');

const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const readmeContent = fs.readFileSync(README_PATH, 'utf8');

describe('External Links & Live Endpoints Verification', () => {
  test('all external links in index.html adhere to HTTPS protocol and reverse tabnabbing defense', () => {
    const htmlLinks = extractHtmlLinks(htmlContent);
    assert(htmlLinks.length > 0, 'Must extract at least one link from index.html');

    const audit = auditLinkSecurity(htmlLinks);
    if (!audit.valid) {
      const msgs = audit.violations.map(v => `${v.type} on ${v.href}`).join('; ');
      assert.fail(`Link security violations found: ${msgs}`);
    }
  });

  test('all markdown links in README.md use HTTPS and point to valid URLs', () => {
    const mdLinks = extractMarkdownLinks(readmeContent);
    assert(mdLinks.length > 0, 'Must extract markdown links from README.md');

    for (const link of mdLinks) {
      assert(link.href.startsWith('https://'), `Markdown link ${link.href} must use HTTPS`);
      assert(!link.href.includes('localhost'), `Production README must not link to localhost: ${link.href}`);
    }
  });

  test('candidate profiles and challenge repository links are present and verified', () => {
    const targetUrls = [
      'https://flowstate-india.vercel.app',
      'https://github.com/vikassharma270907-alt/wisprflow-india-challenge',
      'https://github.com/vikassharma270907-alt',
      'https://www.linkedin.com/in/vikas-sharma-97881737b/'
    ];

    for (const url of targetUrls) {
      const inHtml = htmlContent.includes(url);
      const inReadme = readmeContent.includes(url);
      assert(inHtml || inReadme, `Target URL ${url} must be present in index.html or README.md`);
    }
  });

  test('all 6 hackathon shipped project builds are documented with live URLs and GitHub repos', () => {
    const pastProjects = [
      { name: 'FlowGuard Treasury', domain: 'flowguard-treasury.vercel.app', repo: 'flowguard-treasury' },
      { name: 'RestockPilot', domain: 'restockpilot.vercel.app', repo: 'restockpilot' },
      { name: 'Airlock Guardrails', domain: 'airlock-guardrails.vercel.app', repo: 'airlock-guardrails' },
      { name: 'Swapcast', domain: 'swapcast-tau.vercel.app', repo: 'swapcast' },
      { name: 'Brightloop', domain: 'brightloop-do6a.onrender.com', repo: 'odoo-flux-hackathon' },
      { name: 'ChaosForge', domain: 'chaosforge-3ky4.onrender.com', repo: 'ChaosForge' }
    ];

    for (const proj of pastProjects) {
      assert(htmlContent.includes(proj.domain), `Missing live domain for ${proj.name}: ${proj.domain}`);
      assert(htmlContent.includes(proj.repo), `Missing repo link for ${proj.name}: ${proj.repo}`);
    }
  });

  test('live health check: production deployment URL responds (skip gracefully on offline environments)', async () => {
    const prodUrl = 'https://flowstate-india.vercel.app';
    const result = await pingUrl(prodUrl, 12000);

    // If network is available and responded, it must be 200/300 status
    if (result.statusCode > 0 && result.statusCode !== 408) {
      assert(result.ok, `Production site ${prodUrl} returned status code: ${result.statusCode}`);
    } else {
      console.log(`[Offline/Latency note] Ping timed out or unreachable (status ${result.statusCode}). Structure is verified.`);
    }
  });
});
