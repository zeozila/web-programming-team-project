// Live data from two free APIs (no keys needed):
//  - ExchangeRate-API open endpoint for currency rates
//  - Open-Meteo for weather forecasts

import { load, save } from "./store.js";

// Used only if the rates API can't be reached (checked November 2026).
const FALLBACK_RATES = { KRW: 1, MNT: 2.7, USD: 0.00075 };
const RATES_MAX_AGE = 6 * 60 * 60 * 1000; // 6 hours

async function fetchJson(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Rates with KRW as the base: 1 KRW = rates[code] */
export async function getRates() {
  const cached = load("rates", null);
  if (cached && Date.now() - cached.savedAt < RATES_MAX_AGE) return cached;

  try {
    const data = await fetchJson("https://open.er-api.com/v6/latest/KRW");
    if (data.result !== "success" || !data.rates?.MNT) throw new Error("Bad rates data");
    const result = {
      rates: { KRW: 1, MNT: data.rates.MNT, USD: data.rates.USD },
      updated: data.time_last_update_utc,
      live: true,
      savedAt: Date.now(),
    };
    save("rates", result);
    return result;
  } catch {
    if (cached) return { ...cached, live: false };
    return { rates: FALLBACK_RATES, updated: null, live: false, savedAt: 0 };
  }
}

export function convert(amount, from, to, rates) {
  if (!rates[from] || !rates[to]) return 0;
  return (amount / rates[from]) * rates[to];
}

export async function getWeather(lat, lng) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: 5,
  });
  return fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`);
}

// WMO weather codes used by Open-Meteo -> label + icon name
export function describeWeather(code) {
  if (code === 0) return { label: "Clear sky", icon: "sun" };
  if (code <= 2) return { label: "Partly cloudy", icon: "cloud-sun" };
  if (code === 3) return { label: "Cloudy", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "cloud-fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "cloud-drizzle" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: "Rain", icon: "cloud-rain" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: "Snow", icon: "cloud-snow" };
  if (code >= 95) return { label: "Thunderstorm", icon: "cloud-lightning" };
  return { label: "—", icon: "cloud" };
}
