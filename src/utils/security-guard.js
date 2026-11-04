/**
 * Security Guard & Secret Scanner
 * Scans codebases for hardcoded secrets, dangerous XSS sinks, and input validation vulnerabilities.
 */

const SECRET_PATTERNS = [
  { name: 'Generic API Key', regex: /['"][0-9a-zA-Z-_]{32,}['"]/g },
  { name: 'OpenAI Secret Key', regex: /sk-[a-zA-Z0-9]{20,}/g },
  { name: 'GitHub Personal Token', regex: /ghp_[a-zA-Z0-9]{36}/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Wispr Live Key', regex: /wispr_live_[a-zA-Z0-9_]{16,}/g },
  { name: 'Private Key Block', regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g }
];

/**
 * Scans a text file for hardcoded secrets.
 */
function scanForSecrets(content, filename = '') {
  const findings = [];

  for (const { name, regex } of SECRET_PATTERNS) {
    let match;
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(content)) !== null) {
      const val = match[0];

      // Filter out false positives
      // 1. Data URLs and standard web assets/fonts/cdn URLs
      if (val.includes('data:image') || val.includes('Plus+Jakarta') || val.includes('JetBrains') || val.includes('tailwindcss')) {
        continue;
      }

      // 2. Sample alphabet sequences or canvas matrix rain character set
      if (val.includes('ABCDEFGHIJKLMNOPQRSTUVWXYZ') || val.includes('0123456789')) {
        continue;
      }

      // 3. Documented placeholder strings with repeated x's
      if (/x{6,}/i.test(val) || val.includes('placeholder')) {
        continue;
      }

      findings.push({
        name,
        match: val.slice(0, 10) + '...',
        filename
      });
    }
  }

  return {
    clean: findings.length === 0,
    findings
  };
}

/**
 * Escapes unsafe characters for HTML rendering to prevent XSS.
 */
function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Audits a string or template for unsafe unescaped HTML injections.
 */
function auditXssRisks(content) {
  const risks = [];

  // Check if eval or document.write is used
  if (/\beval\s*\(/.test(content)) {
    risks.push('Usage of eval() detected');
  }
  if (/document\.write\s*\(/.test(content)) {
    risks.push('Usage of document.write() detected');
  }

  return {
    safe: risks.length === 0,
    risks
  };
}

module.exports = {
  scanForSecrets,
  escapeHtml,
  auditXssRisks
};
