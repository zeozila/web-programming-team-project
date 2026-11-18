import { initPage, getDestination, toast, escapeHtml, formatNumber, COUNTRY } from "../lib/app.js";
import { icon } from "../lib/icons.js";
import { getRates, convert, getWeather, describeWeather } from "../lib/api.js";
import { load, save, getFavorites, toggleFavorite } from "../lib/store.js";
import { PLACES, findPlace } from "../data/places.js";
import { photoUrl } from "../data/photos.js";

initPage("planner");

// ============ Currency converter ============

const CURRENCIES = {
  KRW: { symbol: "₩", name: "Korean won", digits: 0, quick: [10000, 50000, 100000] },
  MNT: { symbol: "₮", name: "Mongolian tögrög", digits: 0, quick: [10000, 50000, 100000] },
  USD: { symbol: "$", name: "US dollar", digits: 2, quick: [10, 50, 100] },
};

const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const output = document.getElementById("converted");
const rateStatus = document.getElementById("rate-status");
let rates = null;

const options = Object.entries(CURRENCIES)
  .map(([code, c]) => `<option value="${code}" title="${c.name}">${c.symbol} ${code}</option>`)
  .join("");
fromSelect.innerHTML = options;
toSelect.innerHTML = options;

function setDefaultCurrencies() {
  // you usually convert your home money into the money of where you're going
  const dest = getDestination();
  fromSelect.value = dest === "mongolia" ? "KRW" : "MNT";
  toSelect.value = dest === "mongolia" ? "MNT" : "KRW";
  amountInput.value = fromSelect.value === "MNT" ? 100000 : 10000;
}

function money(value, code) {
  const c = CURRENCIES[code];
  return `${c.symbol}${formatNumber(value, c.digits)}`;
}

function renderConversion() {
  const from = fromSelect.value;
  document.getElementById("quick-amounts").innerHTML = CURRENCIES[from].quick
    .map((n) => `<button type="button" class="chip" data-amount="${n}">${money(n, from)}</button>`)
    .join("");
  if (!rates) return;
  const amount = Math.max(0, Number(amountInput.value) || 0);
  const to = toSelect.value;
  output.textContent = money(convert(amount, from, to, rates.rates), to);
  const one = convert(1, to === "USD" ? to : from, to === "USD" ? from : to, rates.rates);
  const unitLine = to === "USD" ? `$1 = ${money(one, from)}` : `1 ${from} = ${formatNumber(one, one < 1 ? 4 : 2)} ${to}`;
  rateStatus.innerHTML = rates.live
    ? `<span class="live-dot"></span>Live rate · ${unitLine} · updated ${new Date(rates.updated).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
    : `<span class="live-dot off"></span>Offline estimate · ${unitLine}`;
}

amountInput.addEventListener("input", renderConversion);
fromSelect.addEventListener("change", renderConversion);
toSelect.addEventListener("change", renderConversion);
document.getElementById("swap").addEventListener("click", () => {
  [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
  renderConversion();
});
document.getElementById("quick-amounts").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-amount]");
  if (!btn) return;
  amountInput.value = btn.dataset.amount;
  renderConversion();
});
document.getElementById("converter").addEventListener("submit", (event) => event.preventDefault());

// ============ Weather ============

const CITIES = [
  { id: "seoul", name: "Seoul", country: "korea", lat: 37.5665, lng: 126.978 },
  { id: "busan", name: "Busan", country: "korea", lat: 35.1796, lng: 129.0756 },
  { id: "jeju", name: "Jeju", country: "korea", lat: 33.4996, lng: 126.5312 },
  { id: "ub", name: "Ulaanbaatar", country: "mongolia", lat: 47.8864, lng: 106.9057 },
  { id: "gobi", name: "Dalanzadgad (Gobi)", country: "mongolia", lat: 43.5708, lng: 104.425 },
  { id: "khovsgol", name: "Khatgal (Khövsgöl)", country: "mongolia", lat: 50.4417, lng: 100.16 },
  { id: "olgii", name: "Ölgii (Altai)", country: "mongolia", lat: 48.9683, lng: 89.9625 },
];

const citySelect = document.getElementById("city");
const weatherBox = document.getElementById("weather");
citySelect.innerHTML = ["korea", "mongolia"]
  .map(
    (country) =>
      `<optgroup label="${COUNTRY[country].name}">${CITIES.filter((c) => c.country === country)
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join("")}</optgroup>`
  )
  .join("");

let weatherRequest = 0;

async function loadWeather() {
  const city = CITIES.find((c) => c.id === citySelect.value);
  const requestId = ++weatherRequest;
  weatherBox.innerHTML = `<p class="status-line">Loading weather for ${city.name}…</p>`;
  try {
    const data = await getWeather(city.lat, city.lng);
    if (requestId !== weatherRequest) return; // user already picked another city
    const now = describeWeather(data.current.weather_code);
    const days = data.daily.time.map((date, i) => {
      const d = describeWeather(data.daily.weather_code[i]);
      const label = i === 0 ? "Today" : new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short" });
      return `<div><b>${label}</b>${icon(d.icon)}<b>${Math.round(data.daily.temperature_2m_max[i])}°</b><span>${Math.round(
        data.daily.temperature_2m_min[i]
      )}°</span></div>`;
    });
    weatherBox.innerHTML = `
      <div class="weather-now">
        <span class="big-icon">${icon(now.icon)}</span>
        <div>
          <div class="temp">${Math.round(data.current.temperature_2m)}°C</div>
          <div class="desc">${now.label} in ${city.name} · feels like ${Math.round(data.current.apparent_temperature)}°</div>
          <div class="desc">${icon("wind")} ${Math.round(data.current.wind_speed_10m)} km/h · humidity ${data.current.relative_humidity_2m}%</div>
        </div>
      </div>
      <div class="forecast">${days.join("")}</div>`;
  } catch {
    if (requestId !== weatherRequest) return;
    weatherBox.innerHTML = `
      <p>Couldn't load the weather right now.</p>
      <button type="button" class="btn btn-outline btn-sm" id="weather-retry">${icon("rotate-ccw")} Try again</button>`;
    document.getElementById("weather-retry").addEventListener("click", loadWeather);
  }
}
citySelect.addEventListener("change", loadWeather);

// ============ Budget ============

// Rough daily cost per person in local currency.
const DAILY_COST = {
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

function renderBudget() {
  const dest = getDestination();
  const code = COUNTRY[dest].currency;
  const days = Math.min(60, Math.max(1, Number(document.getElementById("days").value) || 1));
  const people = Math.min(20, Math.max(1, Number(document.getElementById("people").value) || 1));
  const costs = DAILY_COST[dest][document.getElementById("style").value];

  const rows = Object.entries(costs).map(([label, perDay]) => ({ label, total: perDay * days * people }));
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const max = Math.max(...rows.map((r) => r.total));
  const usd = rates ? convert(total, code, "USD", rates.rates) : null;

  document.getElementById("budget-sub").textContent = `${days} days in ${COUNTRY[dest].name} for ${people} ${people === 1 ? "person" : "people"}`;
  document.getElementById("budget-result").innerHTML = `
    <div class="budget-total">
      <span>Estimated total</span>
      <strong>${money(total, code)}</strong>
      <span>${usd !== null ? `≈ ${money(usd, "USD")}` : ""} · ${money(total / days / people, code)} per person/day</span>
    </div>
    <div class="budget-bars">
      ${rows
        .map(
          (row) => `
        <div class="budget-bar">
          <span>${row.label}</span>
          <span class="track"><span class="fill" style="width:${(row.total / max) * 100}%"></span></span>
          <span class="amount">${money(row.total, code)}</span>
        </div>`
        )
        .join("")}
    </div>`;
}
document.getElementById("budget-form").addEventListener("input", renderBudget);
document.getElementById("budget-form").addEventListener("submit", (event) => event.preventDefault());

// ============ Packing list ============

const DEFAULT_PACKING = {
  korea: [
    "Passport (+ check visa / K-ETA rules)",
    "T-money card (buy at the airport)",
    "Power adapter — type C/F",
    "Naver Map or KakaoMap installed",
    "Comfortable walking shoes",
    "Power bank",
    "Small umbrella (rainy season is July)",
    "Some cash for markets",
  ],
  mongolia: [
    "Passport (+ check visa rules)",
    "Warm jacket — nights are cold, even in summer",
    "Sunscreen, sunglasses and a hat",
    "Cash in tögrög for the countryside",
    "Power bank & head torch",
    "Wet wipes and hand sanitiser",
    "Motion sickness pills (bumpy roads!)",
    "Lip balm — the air is very dry",
  ],
};

const checklist = document.getElementById("checklist");
const packKey = () => `packing.${getDestination()}`;

function getPacking() {
  const saved = load(packKey(), null);
  if (Array.isArray(saved)) return saved;
  return DEFAULT_PACKING[getDestination()].map((text) => ({ text, done: false }));
}

function renderPacking() {
  const items = getPacking();
  const done = items.filter((i) => i.done).length;
  document.getElementById("pack-sub").textContent = `${done} of ${items.length} packed for ${COUNTRY[getDestination()].name}`;
  document.getElementById("pack-bar").style.width = items.length ? `${(done / items.length) * 100}%` : "0%";
  checklist.innerHTML = items
    .map(
      (item, i) => `
      <li>
        <input type="checkbox" id="pack-${i}" data-index="${i}" ${item.done ? "checked" : ""}>
        <label for="pack-${i}">${escapeHtml(item.text)}</label>
        <button type="button" class="icon-btn remove" data-remove="${i}" aria-label="Remove ${escapeHtml(item.text)}">${icon("trash-2")}</button>
      </li>`
    )
    .join("");
}

checklist.addEventListener("change", (event) => {
  const items = getPacking();
  const index = Number(event.target.dataset.index);
  if (!items[index]) return;
  items[index].done = event.target.checked;
  save(packKey(), items);
  renderPacking();
  if (items.every((i) => i.done)) toast("All packed. Have a great trip!");
});
checklist.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-remove]");
  if (!btn) return;
  const items = getPacking();
  items.splice(Number(btn.dataset.remove), 1);
  save(packKey(), items);
  renderPacking();
});
document.getElementById("add-item").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("new-item");
  const text = input.value.trim();
  if (!text) return;
  const items = getPacking();
  items.push({ text, done: false });
  save(packKey(), items);
  input.value = "";
  renderPacking();
});
document.getElementById("pack-reset").addEventListener("click", () => {
  save(packKey(), null);
  renderPacking();
  toast("Packing list reset");
});

// ============ My trip ============

function renderTrip() {
  const saved = getFavorites().map(findPlace).filter(Boolean);
  const box = document.getElementById("trip-list");
  document.getElementById("trip-sub").textContent = saved.length
    ? `${saved.length} saved ${saved.length === 1 ? "place" : "places"}`
    : "Places you saved on the Explore page";
  document.getElementById("print-trip").hidden = saved.length === 0;

  if (!saved.length) {
    const ideas = PLACES.filter((p) => p.country === getDestination()).slice(0, 3);
    box.innerHTML = `
      <div class="empty-state">
        <span class="hand">Nothing saved yet</span>
        <p>Tap the ♥ on any place to build your trip. Maybe start with ${ideas
          .map((p) => `<a href="explore.html#place=${p.id}">${escapeHtml(p.name)}</a>`)
          .join(", ")}?</p>
        <a class="btn btn-primary btn-sm" href="explore.html">Explore places</a>
      </div>`;
    return;
  }
  box.innerHTML = `<div class="trip-list">${saved
    .map(
      (p) => `
      <div class="trip-item">
        <img src="${photoUrl(p.photos[0], 330)}" alt="" loading="lazy">
        <div>
          <a href="explore.html#place=${p.id}"><strong>${escapeHtml(p.name)}</strong></a>
          <span>${escapeHtml(p.region)}, ${COUNTRY[p.country].name} · ${escapeHtml(p.time)}</span>
        </div>
        <button type="button" class="icon-btn no-print" data-unsave="${p.id}" aria-label="Remove ${escapeHtml(p.name)}">${icon("x")}</button>
      </div>`
    )
    .join("")}</div>`;
}

document.getElementById("trip-list").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-unsave]");
  if (!btn) return;
  toggleFavorite(btn.dataset.unsave);
  toast("Removed from My trip");
});
document.getElementById("print-trip").addEventListener("click", () => window.print());
document.addEventListener("favoriteschange", renderTrip);

// ============ start ============

function onDestination() {
  setDefaultCurrencies();
  renderConversion();
  citySelect.value = getDestination() === "korea" ? "seoul" : "ub";
  loadWeather();
  renderBudget();
  renderPacking();
  renderTrip();
}

document.addEventListener("destinationchange", onDestination);
onDestination();

getRates().then((result) => {
  rates = result;
  renderConversion();
  renderBudget();
});
