import { initPage, toast, escapeHtml, formatNumber, MONTHS, COUNTRY } from "../lib/app.js";
import { icon } from "../lib/icons.js";
import { findTrip, TRIPS, estimateTrip } from "../data/trips.js";
import { findPlace } from "../data/places.js";
import { photoUrl, getPhoto } from "../data/photos.js";
import { DAILY_COST, dailyTotal } from "../data/costs.js";
import { tripCard, bestMonthsText, starsHtml, handleBrokenImages } from "../lib/cards.js";
import { getRates, convert } from "../lib/api.js";
import { getReviews, addReview, getRatingSummary } from "../lib/reviews.js";
import { load, save } from "../lib/store.js";

initPage("trips");
handleBrokenImages();

const trip = findTrip(new URLSearchParams(window.location.search).get("id"));
const SYMBOL = { KRW: "₩", MNT: "₮", USD: "$" };
const money = (value, code) => `${SYMBOL[code]}${formatNumber(value)}`;


// ---------- helpers ----------

// every map point of the trip, in order, with the day it belongs to
function routePoints() {
  const points = [];
  trip.plan.forEach((day, i) => {
    (day.places || []).forEach((id) => {
      const place = findPlace(id);
      if (place) points.push({ day: i + 1, name: place.name, lat: place.lat, lng: place.lng, placeId: id });
    });
    (day.stops || []).forEach((stop) => points.push({ day: i + 1, ...stop }));
  });
  // drop a point if it's the same as the one before (e.g. two days at the same lake)
  return points.filter((p, i) => i === 0 || p.lat !== points[i - 1].lat || p.lng !== points[i - 1].lng);
}

function dayPhoto(day) {
  const first = (day.places || []).map(findPlace).find(Boolean);
  return first ? first.photos[0] : null;
}

// ---------- page ----------

function renderTrip() {
  const country = COUNTRY[trip.country].name;
  document.title = `${trip.name} — SeoulBaatar`;

  const photo = getPhoto(trip.photo);
  const hero = document.getElementById("trip-photo");
  hero.src = photoUrl(trip.photo, 1920);
  hero.alt = photo.caption;
  const credit = document.getElementById("trip-credit");
  credit.href = photo.page;
  credit.textContent = `Photo: ${photo.author}, ${photo.license}`;

  document.getElementById("trip-kicker").textContent = `${trip.days}-day trip · ${country}`;
  document.getElementById("trip-name").textContent = trip.name;
  document.getElementById("trip-summary").textContent = trip.summary;
  document.getElementById("trip-facts").innerHTML = `
    <span>${icon("clock")} ${trip.days} days</span>
    <span>${icon("mountain")} ${trip.pace}</span>
    <span>${icon("calendar")} ${bestMonthsText(trip.best)}</span>
    <span id="hero-rating">${icon("star")} No reviews yet</span>`;

  // overview
  document.getElementById("overview-text").textContent = trip.summary;
  document.getElementById("overview-highlights").innerHTML = trip.highlights.map((h) => `<li>${icon("check")}${escapeHtml(h)}</li>`).join("");

  renderDays();
  renderCost(null);
  document.getElementById("included-list").innerHTML = trip.included.map((t) => `<li>${icon("check")}${escapeHtml(t)}</li>`).join("");
  document.getElementById("not-included-list").innerHTML = trip.notIncluded.map((t) => `<li>${icon("x")}${escapeHtml(t)}</li>`).join("");
  document.getElementById("good-list").innerHTML = trip.goodToKnow.map((t) => `<li>${icon("info")}${escapeHtml(t)}</li>`).join("");
  document.getElementById("trip-months").innerHTML = MONTHS.map(
    (m, i) => `<span class="${trip.best.includes(i + 1) ? "on" : ""}" title="${m}">${m[0]}</span>`
  ).join("");

  renderPriceCard(null);
  initRouteMap();
  setupTabs();
  setupReviews();

  getRates().then((rates) => {
    renderPriceCard(rates);
    renderCost(rates);
  });
  renderMoreTrips(getRatingSummary());
}

function renderDays() {
  document.getElementById("days").innerHTML = trip.plan
    .map((day, i) => {
      const key = dayPhoto(day);
      const places = (day.places || []).map(findPlace).filter(Boolean);
      const chips = [
        ...places.map((p) => `<a class="chip" href="explore.html#place=${p.id}">${icon("map-pin")} ${escapeHtml(p.name)}</a>`),
        ...(day.stops || []).map((s) => `<span class="chip">${icon("map-pin")} ${escapeHtml(s.name)}</span>`),
      ].join("");
      return `
      <li class="day${i === 0 ? " open" : ""}">
        <button type="button" class="day-head" aria-expanded="${i === 0}">
          <span class="day-num">Day ${i + 1}</span>
          <span class="day-title">${escapeHtml(day.title)}</span>
          ${icon("chevron-right", "day-chevron")}
        </button>
        <div class="day-body">
          ${key ? `<img src="${photoUrl(key, 500)}" alt="${escapeHtml(getPhoto(key).caption)}" loading="lazy">` : ""}
          <div>
            <p>${escapeHtml(day.text)}</p>
            <div class="chips">${chips}</div>
            ${day.stay !== "—" ? `<p class="stay">${icon("tent")} <strong>Stay:</strong> ${escapeHtml(day.stay)}</p>` : ""}
          </div>
        </div>
      </li>`;
    })
    .join("");

  const list = document.getElementById("days");
  list.addEventListener("click", (event) => {
    const head = event.target.closest(".day-head");
    if (!head) return;
    const item = head.parentElement;
    const open = !item.classList.contains("open");
    item.classList.toggle("open", open);
    head.setAttribute("aria-expanded", String(open));
  });

  const toggleAll = document.getElementById("toggle-days");
  toggleAll.addEventListener("click", () => {
    const items = list.querySelectorAll(".day");
    const openAll = [...items].some((item) => !item.classList.contains("open"));
    items.forEach((item) => {
      item.classList.toggle("open", openAll);
      item.querySelector(".day-head").setAttribute("aria-expanded", String(openAll));
    });
    toggleAll.textContent = openAll ? "Close all days" : "Open all days";
  });
}

function renderCost(rates) {
  const code = trip.country === "korea" ? "KRW" : "MNT";
  const usd = (value) => (rates ? ` <span class="usd">≈ ${money(convert(value, code, "USD", rates.rates), "USD")}</span>` : "");
  const styles = [
    ["budget", "Backpacker"],
    ["comfort", "Comfortable"],
  ];
  document.getElementById("cost-intro").textContent =
    `Per person for ${trip.days} days, using our daily cost estimates for ${COUNTRY[trip.country].name}.`;

  const rows = styles.map(([style, label]) => {
    const perDay = dailyTotal(trip.country, style);
    const total = perDay * trip.days + trip.extras.amount;
    const parts = Object.entries(DAILY_COST[trip.country][style])
      .map(([name, value]) => `${name} ${money(value, code)}`)
      .join(" · ");
    return `
      <div class="cost-row">
        <div><strong>${label}</strong><span>${money(perDay, code)} a day — ${parts}</span></div>
        <div class="cost-total">${money(total, code)}${usd(total)}</div>
      </div>`;
  });
  const extra = trip.extras.amount
    ? `<div class="cost-row extra"><div><strong>Included above</strong><span>${escapeHtml(trip.extras.label)}</span></div><div class="cost-total">${money(trip.extras.amount, code)}</div></div>`
    : "";
  document.getElementById("cost-table").innerHTML = rows.join("") + extra;
  document.getElementById("cost-note").innerHTML = `Not included: flights to ${COUNTRY[trip.country].name}. Want a different number of days or people? <a href="planner.html">Try the budget calculator</a>.`;
}

// ---------- sidebar ----------

const savedTrips = () => load("savedTrips", []);

function renderPriceCard(rates) {
  const cost = estimateTrip(trip);
  const saved = savedTrips().includes(trip.id);
  const usd = rates
    ? `<span class="usd">≈ ${money(convert(cost.low, cost.currency, "USD", rates.rates), "USD")}–${money(
        convert(cost.high, cost.currency, "USD", rates.rates),
        "USD"
      ).slice(1)}</span>`
    : "";
  document.getElementById("price-card").innerHTML = `
    <small>Estimated per person</small>
    <strong class="price-big">${money(cost.low, cost.currency)}–${money(cost.high, cost.currency).slice(1)}</strong>
    ${usd}
    <span class="price-note">Backpacker to comfortable · ${trip.days} days</span>
    <button type="button" class="btn btn-primary" id="save-trip" aria-pressed="${saved}">${icon("heart")} <span>${saved ? "Saved to my trips" : "Save this trip"}</span></button>
    <a class="btn btn-outline" href="planner.html">${icon("wallet")} Plan my budget</a>
    <button type="button" class="btn btn-outline" id="share-trip">${icon("external-link")} Share this trip</button>
    <ul class="side-facts">
      <li>${icon("clock")} ${trip.days} days, ${trip.pace.toLowerCase()} pace</li>
      <li>${icon("calendar")} Best: ${bestMonthsText(trip.best)}</li>
      <li>${icon("map-pin")} ${routePoints().length} stops on the map</li>
    </ul>`;

  document.getElementById("save-trip").addEventListener("click", (event) => {
    const list = savedTrips();
    const index = list.indexOf(trip.id);
    if (index === -1) list.push(trip.id);
    else list.splice(index, 1);
    save("savedTrips", list);
    const nowSaved = index === -1;
    event.currentTarget.setAttribute("aria-pressed", String(nowSaved));
    event.currentTarget.querySelector("span").textContent = nowSaved ? "Saved to my trips" : "Save this trip";
    toast(nowSaved ? "Trip saved — find it in the Planner" : "Trip removed");
  });

  document.getElementById("share-trip").addEventListener("click", async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) await navigator.share({ title: trip.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }
    } catch {
      // the user closed the share sheet — nothing to do
    }
  });
}

function renderMoreTrips(summary) {
  const others = TRIPS.filter((t) => t.id !== trip.id)
    .sort((a, b) => (a.country === trip.country ? -1 : 1) - (b.country === trip.country ? -1 : 1))
    .slice(0, 3);
  document.getElementById("more-trips").innerHTML = others.map((t) => tripCard(t, summary[t.id])).join("");
}

// ---------- route map ----------

function initRouteMap() {
  const box = document.getElementById("route-map");
  if (!window.L) {
    box.innerHTML = '<p style="padding:20px">The map could not be loaded.</p>';
    return;
  }
  const points = routePoints();
  const map = L.map(box, { scrollWheelZoom: false, attributionControl: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const line = points.map((p) => [p.lat, p.lng]);
  L.polyline(line, { color: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#1c5bb5", weight: 3, dashArray: "6 8" }).addTo(map);

  points.forEach((p, i) => {
    L.marker([p.lat, p.lng], {
      title: p.name,
      icon: L.divIcon({ className: "", html: `<div class="route-pin">${i + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
    })
      .bindPopup(`<strong>Day ${p.day}</strong><br>${escapeHtml(p.name)}`)
      .addTo(map);
  });

  const fit = () => {
    map.invalidateSize();
    if (line.length === 1) map.setView(line[0], 9);
    else map.fitBounds(L.latLngBounds(line), { padding: [30, 30], maxZoom: 11 });
  };
  fit();
  // re-fit if the map was laid out before it had its final size
  new ResizeObserver(fit).observe(box);
}

// ---------- tabs bar: highlight the section in view ----------

function setupTabs() {
  const links = [...document.querySelectorAll(".trip-tabs a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((section) => section && observer.observe(section));
}

// ---------- reviews ----------

function timeAgo(iso) {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function renderReviews(list) {
  const box = document.getElementById("rating-box");
  const listBox = document.getElementById("review-list");
  const count = list.length;
  const average = count ? list.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  document.getElementById("hero-rating").innerHTML = count
    ? `${icon("star")} ${average.toFixed(1)} (${count} ${count === 1 ? "review" : "reviews"})`
    : `${icon("star")} No reviews yet`;

  const bars = [5, 4, 3, 2, 1]
    .map((n) => {
      const c = list.filter((r) => r.rating === n).length;
      return `<div class="rating-bar"><span>${n} ★</span><span class="track"><span class="fill" style="width:${count ? (c / count) * 100 : 0}%"></span></span><span>${c}</span></div>`;
    })
    .join("");
  box.innerHTML = count
    ? `<div class="avg">${average.toFixed(1)}</div>${starsHtml(average)}<p>${count} ${count === 1 ? "review" : "reviews"}</p>${bars}`
    : `<div class="avg">–</div>${starsHtml(0)}<p>No reviews yet</p>${bars}`;

  listBox.innerHTML = count
    ? list
        .map(
          (r) => `
        <article class="review">
          <div class="review-head">
            <span class="avatar small">${escapeHtml(r.name.trim().charAt(0).toUpperCase() || "?")}</span>
            <div><strong>${escapeHtml(r.name)}</strong><span>${timeAgo(r.created_at)}</span></div>
            <span class="review-stars" aria-label="${r.rating} out of 5 stars">${starsHtml(r.rating)}</span>
          </div>
          <p>${escapeHtml(r.comment)}</p>
        </article>`
        )
        .join("")
    : `<div class="empty-state"><span class="hand">Be the first!</span><p>Have you done this trip, or part of it? Tell other travellers how it went.</p></div>`;
}

function loadReviews() {
  renderReviews(getReviews(trip.id));
}

function setupReviews() {
  const form = document.getElementById("review-form");
  const error = document.getElementById("review-error");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const rating = Number(data.get("rating"));
    const name = String(data.get("name") || "").trim();
    const comment = String(data.get("comment") || "").trim();

    const showError = (message) => {
      error.textContent = message;
      error.hidden = false;
    };
    error.hidden = true;

    if (!rating) return showError("Please choose a star rating.");
    if (!name) return showError("Please tell us your name.");
    if (comment.length < 10) return showError("Please write at least a short sentence (10+ characters).");

    addReview({ tripId: trip.id, name, rating, comment });
    form.reset();
    toast("Thanks for your review!");
    loadReviews();
  });

  loadReviews();
}

// ---------- start ----------

if (!trip) {
  document.getElementById("trip-name").textContent = "Trip not found";
  document.getElementById("trip-summary").innerHTML = 'Maybe the link is old. <a href="trips.html" style="color:#fff">See all trips</a>.';
  document.getElementById("trip-layout").hidden = true;
  document.querySelector(".trip-tabs").hidden = true;
} else {
  renderTrip();
}
