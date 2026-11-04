/**
 * Funnel Calculation Engine
 * Models Wispr Flow's 14% to 2% Android-to-desktop conversion funnel.
 */

function calculateFunnelMetrics({
  cap = 2000,
  bonusState = 'reduce',
  trigger = 'cap-upi',
  studentOn = true,
  baseUsers = 100000,
  monthlyPriceInr = 320
} = {}) {
  // Base conversion rate: 2.1%
  let rate = 2.1;

  // Cap impact: (3000 - cap) / 1000 * 0.7
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

  // Hard clamp: 1.0% <= rate <= 8.5%
  if (rate < 1.0) rate = 1.0;
  if (rate > 8.5) rate = 8.5;

  const conversionRate = parseFloat(rate.toFixed(1));
  const conversionLiftPercent = parseFloat(((rate / 2.1 - 1) * 100).toFixed(0));

  const payingUsers = Math.round(baseUsers * (rate / 100));
  const annualRevenueInr = payingUsers * monthlyPriceInr * 12;
  const arrInCrores = parseFloat((annualRevenueInr / 10000000).toFixed(2));

  return {
    conversionRate,
    conversionLiftPercent,
    payingUsers,
    annualRevenueInr,
    arrInCrores
  };
}

module.exports = {
  calculateFunnelMetrics
};
