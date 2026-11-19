// Place card used on the Home page and the Explore page.

import { icon } from "./icons.js";
import { photoUrl, getPhoto } from "../data/photos.js";
import { CATEGORIES } from "../data/places.js";
import { isFavorite, toggleFavorite } from "./store.js";
import { MONTHS, escapeHtml, toast, formatNumber } from "./app.js";
import { estimateTrip } from "../data/trips.js";

export function bestMonthsText(best) {
  if (best.length === 12) return "Good all year";
  // turn [4,5,9,10] into "Apr–May, Sep–Oct"
  const groups = [];
  let start = best[0];
  let prev = best[0];
  for (let i = 1; i <= best.length; i++) {
    const month = best[i];
    if (month === prev + 1) {
      prev = month;
      continue;
    }
    groups.push(start === prev ? MONTHS[start - 1] : `${MONTHS[start - 1]}–${MONTHS[prev - 1]}`);
    start = prev = month;
  }
  return groups.join(", ");
}

export function placeCard(place, href = `explore.html#place=${place.id}`) {
  const photoKey = place.photos[0];
  const photo = getPhoto(photoKey);
  const saved = isFavorite(place.id);
  return `
    <article class="place-card" data-id="${place.id}">
      <div class="media img-fallback">
        <img src="${photoUrl(photoKey, 500)}" alt="${escapeHtml(photo?.caption || place.name)}" loading="lazy" decoding="async">
        <span class="tag">${CATEGORIES[place.category]}</span>
      </div>
      <button type="button" class="fav-btn" data-fav="${place.id}" aria-pressed="${saved}"
        aria-label="Save ${escapeHtml(place.name)} to my trip">${icon("heart")}</button>
      <div class="body">
        <span class="meta">${icon("map-pin")} ${escapeHtml(place.region)}, ${place.country === "korea" ? "Korea" : "Mongolia"}</span>
        <h3><a href="${href}" data-open="${place.id}">${escapeHtml(place.name)}</a></h3>
        <span class="local" lang="${place.country === "korea" ? "ko" : "mn"}">${escapeHtml(place.local)}</span>
        <span class="best">${icon("calendar")} ${bestMonthsText(place.best)}</span>
      </div>
    </article>`;
}

// One listener per container handles every heart button inside it.
export function bindFavButtons(container) {
  container.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-fav]");
    if (!btn) return;
    event.preventDefault();
    event.stopPropagation();
    const added = toggleFavorite(btn.dataset.fav);
    toast(added ? "Saved to My trip ♥" : "Removed from My trip");
  });

  // keep every heart on the page in sync
  document.addEventListener("favoriteschange", () => {
    container.querySelectorAll("[data-fav]").forEach((btn) => {
      const saved = isFavorite(btn.dataset.fav);
      btn.setAttribute("aria-pressed", String(saved));
    });
  });
}

// Show a soft placeholder if a photo can't load (offline etc.)
export function handleBrokenImages(root = document) {
  root.addEventListener(
    "error",
    (event) => {
      if (event.target.tagName === "IMG") event.target.style.visibility = "hidden";
    },
    true
  );
}

// ---------- trip card (Trips page, Home, trip page) ----------

const SYMBOL = { KRW: "₩", MNT: "₮", USD: "$" };

// ₮1,875,000 -> "₮1.9M", ₩270,000 -> "₩270,000"
export function shortMoney(value, code) {
  const symbol = SYMBOL[code];
  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
  return `${symbol}${formatNumber(value)}`;
}

export function starsHtml(rating) {
  const full = Math.round(rating);
  return `<span class="stars" aria-hidden="true">${"★".repeat(full)}<span class="off">${"★".repeat(5 - full)}</span></span>`;
}

export function ratingText(summary) {
  if (!summary) return `<span class="rating none">No reviews yet</span>`;
  return `<span class="rating">${starsHtml(summary.average)} ${summary.average.toFixed(1)} <span class="count">(${summary.count})</span></span>`;
}

export function tripCard(trip, summary) {
  const cost = estimateTrip(trip);
  const country = trip.country === "korea" ? "Korea" : "Mongolia";
  return `
    <article class="trip-card">
      <div class="media img-fallback">
        <img src="${photoUrl(trip.photo, 960)}" alt="${escapeHtml(getPhoto(trip.photo)?.caption || trip.name)}" loading="lazy" decoding="async">
        <span class="tag ${trip.country}">${country}</span>
        <span class="tag pace">${trip.pace}</span>
      </div>
      <div class="body">
        <span class="meta">${icon("clock")} ${trip.days} days · ${icon("calendar")} ${bestMonthsText(trip.best)}</span>
        <h3><a href="trip.html?id=${trip.id}">${escapeHtml(trip.name)}</a></h3>
        <ul class="trip-highlights">${trip.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>
        <div class="trip-foot">
          <span class="price"><small>Est. per person</small><strong>${shortMoney(cost.low, cost.currency)}–${shortMoney(cost.high, cost.currency).slice(1)}</strong></span>
          ${ratingText(summary)}
        </div>
      </div>
    </article>`;
}
