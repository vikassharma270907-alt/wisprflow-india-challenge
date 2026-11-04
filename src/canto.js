/**
 * FlowState India // Canto Voice Processing Engine
 * Real-time sub-200ms text cleanup, filler stripping, and tech acronym capitalization.
 */

export const ACRONYM_MAP = {
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

export const FILLER_REGEX = /\b(um|umm|uh|uhh|matlab|basically|you know|yaani|like)\b/gi;

export function cantoPostProcess(text, {
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
    const matches = cleaned.match(FILLER_REGEX);
    if (matches) {
      fillersCount = matches.length;
    }
    cleaned = cleaned.replace(FILLER_REGEX, '');
  }

  // 2. Resolve Mid-Sentence Course Corrections
  // Example: "Indiranagar actually Koramangala" -> "Koramangala"
  if (filterCourseCorrect) {
    cleaned = cleaned.replace(/(.*?),?\s+actually\s+(nahi\s+)?(.*?)/gi, '$3');
  }

  // 3. Auto-Capitalize Acronyms & Domain Terms
  if (filterAcronyms) {
    for (const [pattern, repl] of Object.entries(ACRONYM_MAP)) {
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
