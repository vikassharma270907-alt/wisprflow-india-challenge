const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { cantoPostProcess } = require('../src/engine/canto-processor');

describe('Canto NLP Speech Post-Processing Pipeline Tests', () => {
  test('strips English and Hinglish filler words while counting them', () => {
    const raw = "bhai PR merge kar de matlab umm like production break ho gaya uh";
    const result = cantoPostProcess(raw, { filterFillers: true, filterAcronyms: true, filterCourseCorrect: true });

    // Fillers present: matlab, umm, like, uh -> count should be >= 4
    assert(result.fillersCount >= 4, `Expected at least 4 fillers, got ${result.fillersCount}`);
    assert(!result.text.includes('matlab'));
    assert(!result.text.includes('umm'));
    assert(!result.text.includes('like'));
    assert(!result.text.includes(' uh '));
  });

  test('resolves mid-sentence course corrections accurately', () => {
    const raw = "Let us meet at Indiranagar, actually Indiranagar nahi Koramangala chalte hai";
    const result = cantoPostProcess(raw, { filterFillers: true, filterAcronyms: true, filterCourseCorrect: true });

    // Should resolve to Koramangala
    assert(result.text.includes('Koramangala'));
  });

  test('auto-capitalizes technical acronyms and key Bangalore/Wispr domain entities', () => {
    const raw = "tanay and nimisha discussed the gtm roadmap for wispr flow arr and api latency in bangalore";
    const result = cantoPostProcess(raw, { filterFillers: true, filterAcronyms: true, filterCourseCorrect: false });

    assert(result.text.includes('Tanay'));
    assert(result.text.includes('Nimisha'));
    assert(result.text.includes('GTM'));
    assert(result.text.includes('Wispr Flow'));
    assert(result.text.includes('ARR'));
    assert(result.text.includes('API'));
    assert(result.text.includes('Bangalore'));
  });

  test('ensures professional sentence casing and terminal punctuation', () => {
    const raw = "speed matters more than perfection in voice growth";
    const result = cantoPostProcess(raw);

    assert(result.text.startsWith('S'), 'Must capitalize first character');
    assert(result.text.endsWith('.'), 'Must end with terminal period');

    // Existing punctuation is preserved
    const question = "Are we shipping today?";
    const questionResult = cantoPostProcess(question);
    assert(questionResult.text.endsWith('?'), 'Must preserve question mark');
  });

  test('handles null, undefined, empty, and whitespace strings safely', () => {
    assert.deepEqual(cantoPostProcess(''), { text: '', fillersCount: 0 });
    assert.deepEqual(cantoPostProcess('   '), { text: '', fillersCount: 0 });
    assert.deepEqual(cantoPostProcess(null), { text: '', fillersCount: 0 });
    assert.deepEqual(cantoPostProcess(undefined), { text: '', fillersCount: 0 });
  });
});
