/**
 * Link Scanner & Protocol Validator
 * Scans HTML and Markdown files, checks protocol compliance, security attributes,
 * and validates external URLs.
 */

const https = require('node:https');
const http = require('node:http');
const { URL } = require('node:url');

/**
 * Extracts links from an HTML string along with target and rel attributes.
 */
function extractHtmlLinks(htmlContent) {
  const links = [];
  const regex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi;
  let match;

  while ((match = regex.exec(htmlContent)) !== null) {
    const fullAttrs = `${match[1]} ${match[3]}`;
    const href = match[2];

    const targetMatch = fullAttrs.match(/target=["']([^"']+)["']/i);
    const relMatch = fullAttrs.match(/rel=["']([^"']+)["']/i);

    links.push({
      href,
      target: targetMatch ? targetMatch[1] : null,
      rel: relMatch ? relMatch[1] : null,
      rawTag: match[0]
    });
  }

  return links;
}

/**
 * Extracts links from a Markdown string.
 */
function extractMarkdownLinks(mdContent) {
  const links = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
  let match;

  while ((match = regex.exec(mdContent)) !== null) {
    links.push({
      text: match[1],
      href: match[2]
    });
  }

  return links;
}

/**
 * Audits links for security best practices:
 * - target="_blank" must have rel="noreferrer" or rel="noopener"
 * - external links must use HTTPS
 */
function auditLinkSecurity(links) {
  const violations = [];

  for (const link of links) {
    if (link.target === '_blank') {
      const rel = (link.rel || '').toLowerCase();
      if (!rel.includes('noreferrer') && !rel.includes('noopener')) {
        violations.push({
          type: 'MISSING_REL_NOOPENER',
          href: link.href,
          message: `External link with target="_blank" lacks rel="noopener" or rel="noreferrer"`
        });
      }
    }

    if (link.href && link.href.startsWith('http://') && !link.href.includes('localhost')) {
      violations.push({
        type: 'INSECURE_HTTP_PROTOCOL',
        href: link.href,
        message: `Insecure HTTP protocol used instead of HTTPS`
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Pings a URL with a HEAD or GET request and returns the status code.
 */
function pingUrl(urlStr, timeoutMs = 7000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.request(
        parsed,
        {
          method: 'HEAD',
          timeout: timeoutMs,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlowState-Audit/1.0'
          }
        },
        (res) => {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, statusCode: res.statusCode, url: urlStr });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, statusCode: 408, error: 'TIMEOUT', url: urlStr });
      });

      req.on('error', (err) => {
        resolve({ ok: false, statusCode: 0, error: err.message, url: urlStr });
      });

      req.end();
    } catch (e) {
      resolve({ ok: false, statusCode: 0, error: e.message, url: urlStr });
    }
  });
}

module.exports = {
  extractHtmlLinks,
  extractMarkdownLinks,
  auditLinkSecurity,
  pingUrl
};
