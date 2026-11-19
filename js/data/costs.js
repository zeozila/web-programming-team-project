// Rough daily cost per person in local currency (KRW for Korea, MNT for Mongolia),
// based on typical 2025–2026 prices. Used by the budget calculator and the trip pages.

export const DAILY_COST = {
  korea: {
    budget: { Sleep: 35000, Food: 30000, Transport: 10000, Activities: 15000 },
    comfort: { Sleep: 110000, Food: 60000, Transport: 20000, Activities: 35000 },
    luxury: { Sleep: 300000, Food: 150000, Transport: 60000, Activities: 90000 },
  },
  mongolia: {
    budget: { Sleep: 50000, Food: 40000, Transport: 25000, Activities: 30000 },
    comfort: { Sleep: 150000, Food: 80000, Transport: 80000, Activities: 80000 },
    luxury: { Sleep: 450000, Food: 180000, Transport: 250000, Activities: 200000 },
  },
};

export function dailyTotal(country, style) {
  return Object.values(DAILY_COST[country][style]).reduce((sum, value) => sum + value, 0);
}
