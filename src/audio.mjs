/**
 * FlowState India // Acoustic Simulation & Noise Rejection Models
 */

export const NOISE_PROFILES = {
  metro: {
    id: 'metro',
    title: 'Namma Metro (Peak Hour)',
    splDB: 82,
    frequencies: '60Hz - 250Hz low rumble + 2.5kHz station chime',
    attenuationDb: -26
  },
  darshini: {
    id: 'darshini',
    title: 'Darshini Filter Coffee Machine',
    splDB: 78,
    frequencies: '800Hz - 4kHz high steam hiss + stainless steel clatter',
    attenuationDb: -22
  },
  traffic: {
    id: 'traffic',
    title: 'Silk Board Junction Traffic',
    splDB: 88,
    frequencies: '120Hz two-stroke auto drone + 3.2kHz multi-tone air horns',
    attenuationDb: -31
  }
};

export function calculateAcousticRejection(noiseId, filterEnabled = true) {
  const profile = NOISE_PROFILES[noiseId];
  if (!profile) {
    throw new Error(`Unknown noise profile: ${noiseId}`);
  }

  const rawSPL = profile.splDB;
  const filteredSPL = filterEnabled ? Math.max(30, rawSPL + profile.attenuationDb) : rawSPL;
  const snrImprovementDb = filterEnabled ? Math.abs(profile.attenuationDb) : 0;

  return {
    rawSPL,
    filteredSPL,
    snrImprovementDb,
    voiceIntelligibilityScore: filterEnabled ? 98.4 : 54.2
  };
}
