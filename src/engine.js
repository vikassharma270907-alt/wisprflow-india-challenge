/**
 * FlowState India // Core Growth & Speech Engine
 * Pure, immutable business logic extracted for deterministic testing & execution
 */

/**
 * Calculates conversion rate, lift, paying users, and ARR based on the simulator model.
 * 
 * Formula:
 * - Base conversion rate: 2.1%
 * - Cap impact: (3000 - cap) / 1000 * 0.7
 * - Bonus impact: 'eliminate' -> +1.4%, 'reduce' -> +1.1%, other -> -0.5%
 * - Trigger impact: 'cap-upi' -> +1.5%, 'styles-gate' -> +0.9%, other -> 0.0%
 * - Student impact: true -> +0.4%, false -> 0.0%
 * - Clamped: [1.0%, 8.5%]
 * - ARR: 100,000 MAU * (rate / 100) * ₹320 * 12 (in Crores: / 10,000,000)
 */
function calculateSimulator({
  cap = 2000,
  bonusState = 'reduce',
  trigger = 'cap-upi',
  studentOn = true,
  baseUsers = 100000,
  monthlyPriceInr = 320
} = {}) {
  let rate = 2.1;

  // Cap impact
  rate += ((3000 - cap) / 1000) * 0.7;

  // Bonus impact
  if (bonusState === 'eliminate') {
    rate += 1.4;
  } else if (bonusState === 'reduce') {
    rate += 1.1;
  } else {
    rate -= 0.5;
  }

  // Trigger impact
  if (trigger === 'cap-upi') {
    rate += 1.5;
  } else if (trigger === 'styles-gate') {
    rate += 0.9;
  }

  // Student harmonization
  if (studentOn) {
    rate += 0.4;
  }

  // Clamping
  if (rate < 1.0) rate = 1.0;
  if (rate > 8.5) rate = 8.5;

  const rateFormatted = parseFloat(rate.toFixed(1));
  const lift = parseFloat(((rate / 2.1 - 1) * 100).toFixed(0));

  const payingUsers = Math.round(baseUsers * (rate / 100));
  const annualRevInr = payingUsers * monthlyPriceInr * 12;
  const crores = parseFloat((annualRevInr / 10000000).toFixed(2));

  return {
    conversionRate: rateFormatted,
    conversionLiftPercent: lift,
    payingUsers,
    annualRevenueInr: annualRevInr,
    arrInCrores: crores
  };
}

/**
 * Canto Post-Processing Pipeline
 * Simulates real-time transcription formatting, filler removal,
 * mid-sentence course-correction, and domain acronym capitalization.
 */
function cantoPostProcess(text, {
  filterFillers = true,
  filterAcronyms = true,
  filterCourseCorrect = true
} = {}) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return { text: '', fillersCount: 0 };
  }

  let cleaned = text;
  let fillersCount = 0;

  // 1. Strip Fillers (English & Indian slang)
  if (filterFillers) {
    const fillersRegex = /\b(um|umm|uh|uhh|matlab|basically|you know|yaani|like)\b/gi;
    const matches = cleaned.match(fillersRegex);
    if (matches) fillersCount = matches.length;
    cleaned = cleaned.replace(fillersRegex, '');
  }

  // 2. Resolve Mid-Sentence Course Corrections
  if (filterCourseCorrect) {
    // Example: "Indiranagar actually Koramangala" -> "Koramangala"
    cleaned = cleaned.replace(/(.*?),?\s+actually\s+(nahi\s+)?(.*?)/gi, '$3');
  }

  // 3. Auto-Capitalize Acronyms & Domain Terms
  if (filterAcronyms) {
    const replacements = {
      '\\bpr\\b': 'PR',
      '\\bapi\\b': 'API',
      '\\bapis\\b': 'APIs',
      '\\bupi\\b': 'UPI',
      '\\barr\\b': 'ARR',
      '\\bmau\\b': 'MAU',
      '\\bgtm\\b': 'GTM',
      '\\bide\\b': 'IDE',
      '\\bwer\\b': 'WER',
      '\\bwispr flow\\b': 'Wispr Flow',
      '\\bwispr\\b': 'Wispr',
      '\\bcanto\\b': 'Canto',
      '\\bgboard\\b': 'Gboard',
      '\\btanay\\b': 'Tanay',
      '\\bnimisha\\b': 'Nimisha',
      '\\bariya\\b': 'Ariya',
      '\\bbangalore\\b': 'Bangalore',
      '\\bindiranagar\\b': 'Indiranagar',
      '\\bkoramangala\\b': 'Koramangala',
      '\\bemergent\\b': 'Emergent'
    };

    for (const [pattern, repl] of Object.entries(replacements)) {
      cleaned = cleaned.replace(new RegExp(pattern, 'gi'), repl);
    }
  }

  // 4. Formatting & Whitespace Clean-up
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (!cleaned.endsWith('.') && !cleaned.endsWith('?') && !cleaned.endsWith('!')) {
      cleaned += '.';
    }
  }

  return { text: cleaned, fillersCount };
}

/**
 * Terminal Command Dispatcher
 * Parses and returns deterministic responses for FlowOS CLI commands.
 */
function parseTerminalCommand(cmdString) {
  if (!cmdString || typeof cmdString !== 'string') return null;
  const cmd = cmdString.trim().toLowerCase();

  switch (cmd) {
    case 'help':
      return {
        status: 'ok',
        command: 'help',
        available: ['status', 'simulate', 'benchmark', 'rig', 'canto', 'noise', 'whoami', 'matrix', 'clear', 'sudo rm -rf /']
      };
    case 'status':
      return {
        status: 'ok',
        command: 'status',
        telemetry: {
          wordsDictated: 8420,
          wpm: 162,
          cantoWer: 10.2,
          latencyMs: 210,
          rig: 'Bangalore Field Rig #01'
        }
      };
    case 'simulate':
      return {
        status: 'ok',
        command: 'simulate',
        projectedConversion: 5.8,
        conversionLift: '+2.76x',
        projectedArrInr: '₹2.22 Crore'
      };
    case 'benchmark':
      return {
        status: 'ok',
        command: 'benchmark',
        wisprAccuracy: 92.5,
        gboardAccuracy: 71.0,
        summary: 'Flow dominance on tech terms, whisper mode, and high noise.'
      };
    case 'rig':
      return {
        status: 'ok',
        command: 'rig',
        totalGrant: 3000,
        breakdown: [
          { name: 'Live Proof Field Kit', amount: 1150 },
          { name: '25-Creator Micro-Grant Pool', amount: 1250 },
          { name: 'Multi-Handset Android QA Rig', amount: 600 }
        ]
      };
    case 'canto':
      return {
        status: 'ok',
        command: 'canto',
        specs: {
          architecture: 'Context-conditioned transformer decoder',
          conditioning: 'Multi-modal tokens',
          latencyCeilingMs: 700
        }
      };
    case 'whoami':
      return {
        status: 'ok',
        command: 'whoami',
        candidate: 'Vikas Sharma',
        location: 'Indore, MP, India',
        relocation: 'Ready to Relocate / Join Immediately',
        role: 'Search Engine Optimization Analyst at RankVed Healthcare Martech · Current Intern @ Rankved',
        company: 'RankVed Healthcare Martech (Rankved)',
        verifiedWords: 8420
      };
    case 'matrix':
      return { status: 'action', command: 'matrix', action: 'startMatrixRain' };
    case 'clear':
      return { status: 'action', command: 'clear', action: 'clearTerminal' };
    case 'sudo rm -rf /':
      return { status: 'panic', command: 'sudo rm -rf /', message: 'KERNEL PANIC' };
    default:
      return { status: 'error', command: cmd, message: `Command not found: ${cmd}` };
  }
}

/**
 * Validates verified telemetry metrics against challenge guidelines.
 */
function validateTelemetry({ words, wpm, wer, latencyMs }) {
  const errors = [];
  if (typeof words !== 'number' || words < 5000) {
    errors.push(`Words dictated (${words}) is below recommended 5,000 threshold for proof of work.`);
  }
  if (typeof wpm !== 'number' || wpm < 120 || wpm > 250) {
    errors.push(`Mean dictation velocity (${wpm} WPM) outside realistic range (120-250 WPM).`);
  }
  if (typeof wer !== 'number' || wer < 0 || wer > 20) {
    errors.push(`Word Error Rate (${wer}%) exceeds competitive ceiling.`);
  }
  if (typeof latencyMs !== 'number' || latencyMs > 700) {
    errors.push(`End-to-end latency (${latencyMs}ms) exceeds 700ms hard ceiling.`);
  }
  return { valid: errors.length === 0, errors };
}

// Export for Node.js test environment and ES/browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateSimulator,
    cantoPostProcess,
    parseTerminalCommand,
    validateTelemetry
  };
}
