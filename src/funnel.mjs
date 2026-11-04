/**
 * FlowState India // 14% -> 2% Funnel Conversion Simulator Engine
 * Models Indian subscriber monetization, cap throttling, and UPI AutoPay triggers.
 */

export function calculateFunnel({
  cap = 2000,
  trigger = 'cap-upi',
  bonusState = 'eliminate',
  studentOn = true,
  baseUsers = 100000,
  monthlyPriceINR = 320
} = {}) {
  // Base organic conversion rate without intervention: 2.1%
  let rate = 2.1;

  // 1. Cap impact: throttling from 3000 words/week down to 1000 words/week
  rate += ((3000 - cap) / 1000) * 0.7;

  // 2. Word bonus policy impact
  if (bonusState === 'eliminate') {
    rate += 1.4; // 2,000w sprint replaces 8,000w cap bonus
  } else if (bonusState === 'reduce') {
    rate += 1.1; // Reduced bonus
  } else {
    rate -= 0.5; // Unlimited 8k free bonuses dilutes upgrade urgency
  }

  // 3. Upgrade trigger impact
  if (trigger === 'cap-upi') {
    rate += 1.5; // Contextual UPI AutoPay modal right at word 2,000
  } else if (trigger === 'styles-gate') {
    rate += 0.9; // AI Styles desktop gating
  } else {
    rate += 0.0; // Generic banner
  }

  // 4. Student & Tier-2 price parity harmonization
  if (studentOn) {
    rate += 0.4; // Student verification boost
  }

  // Realistic bounds clamp
  if (rate < 1.0) rate = 1.0;
  if (rate > 8.5) rate = 8.5;
  rate = Math.round(rate * 10) / 10;

  const rateFormatted = rate.toFixed(1) + '%';
  const liftNum = ((rate / 2.1 - 1) * 100);
  const lift = liftNum.toFixed(0);
  const liftFormatted = (liftNum >= 0 ? '+' : '') + lift + '% conversion lift';

  const payingUsers = Math.round(baseUsers * (rate / 100));
  const annualRevINR = payingUsers * monthlyPriceINR * 12;
  const crores = (annualRevINR / 10000000).toFixed(2);
  const arrFormatted = '₹' + crores + ' Cr';

  return {
    rate,
    rateFormatted,
    lift: Number(lift),
    liftFormatted,
    payingUsers,
    annualRevINR,
    crores: Number(crores),
    arrFormatted
  };
}
