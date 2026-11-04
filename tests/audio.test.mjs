import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NOISE_PROFILES, calculateAcousticRejection } from '../src/audio.mjs';

describe('Acoustic Simulation & Noise Rejection Tests', () => {
  test('all required Bangalore ambient noise profiles are present', () => {
    assert.ok(NOISE_PROFILES.metro, 'Metro profile missing');
    assert.ok(NOISE_PROFILES.darshini, 'Darshini cafe profile missing');
    assert.ok(NOISE_PROFILES.traffic, 'Silk Board traffic profile missing');
  });

  test('noise profile SPL levels match verified Bangalore field measurements', () => {
    assert.strictEqual(NOISE_PROFILES.metro.splDB, 82);
    assert.strictEqual(NOISE_PROFILES.darshini.splDB, 78);
    assert.strictEqual(NOISE_PROFILES.traffic.splDB, 88);
  });

  test('Canto acoustic filter attenuates ambient noise significantly', () => {
    const rawMetro = calculateAcousticRejection('metro', false);
    const filteredMetro = calculateAcousticRejection('metro', true);

    assert.strictEqual(rawMetro.rawSPL, 82);
    assert.strictEqual(rawMetro.filteredSPL, 82);
    assert.strictEqual(rawMetro.snrImprovementDb, 0);

    assert.strictEqual(filteredMetro.rawSPL, 82);
    assert.strictEqual(filteredMetro.filteredSPL, 56); // 82 - 26
    assert.strictEqual(filteredMetro.snrImprovementDb, 26);
    assert.ok(filteredMetro.voiceIntelligibilityScore > 90);
  });

  test('throws error for invalid profile', () => {
    assert.throws(() => calculateAcousticRejection('unknown_sound'), /Unknown noise profile/);
  });
});
