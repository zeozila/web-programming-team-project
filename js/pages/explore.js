import { initPage, getDestination, toast, escapeHtml, MONTHS, COUNTRY } from "../lib/app.js";
import { icon } from "../lib/icons.js";
import { PLACES, CATEGORIES, findPlace } from "../data/places.js";
import { tripsWithPlace } from "../data/trips.js";
import { photoUrl, getPhoto } from "../data/photos.js";
import { placeCard, bindFavButtons, handleBrokenImages } from "../lib/cards.js";
import { getFavorites, isFavorite, toggleFavorite } from "../lib/store.js";

initPage("explore");
handleBrokenImages();

// ---------- filter state ----------

const params = new URLSearchParams(window.location.search);
const state = {
  country: ["korea", "mongolia", "all"].includes(params.get("country")) ? params.get("country") : getDestination(),
  category: "all",
  month: 0,
  search: "",
  savedOnly: false,
};

const grid = document.getElementById("place-grid");
const countBox = document.getElementById("result-count");
const searchInput = document.getElementById("search");
const monthSelect = document.getElementById("month-filter");
const savedToggle = document.getElementById("saved-toggle");
const countryButtons = document.querySelectorAll("[data-country]");
const categoryBox = document.getElementById("category-filter");

// build category chips and month options from the data
categoryBox.innerHTML = [["all", "Everything"], ...Object.entries(CATEGORIES)]
  .map(([key, label]) => `<button type="button" class="chip" data-category="${key}" aria-pressed="${key === "all"}">${label}</button>`)
  .join("");
monthSelect.insertAdjacentHTML(
  "beforeend",
  MONTHS.map((m, i) => `<option value="${i + 1}">Good in ${new Date(2026, i, 1).toLocaleString("en-US", { month: "long" })}</option>`).join("")
);

function normalize(text) {
  // so "sukhbaatar" also finds "Sükhbaatar"
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function filteredPlaces() {
  const query = normalize(state.search.trim());
  const favorites = getFavorites();
  return PLACES.filter((place) => {
    if (state.country !== "all" && place.country !== state.country) return false;
    if (state.category !== "all" && place.category !== state.category) return false;
    if (state.month && !place.best.includes(state.month)) return false;
    if (state.savedOnly && !favorites.includes(place.id)) return false;
    if (query) {
      const haystack = normalize([place.name, place.local, place.region, place.about, CATEGORIES[place.category]].join(" "));
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

let currentList = [];

function render() {
  currentList = filteredPlaces();

  countryButtons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.country === state.country)));
  categoryBox.querySelectorAll("[data-category]").forEach((btn) =>
    btn.setAttribute("aria-pressed", String(btn.dataset.category === state.category))
  );
  savedToggle.setAttribute("aria-pressed", String(state.savedOnly));

  const n = currentList.length;
  countBox.textContent = `${n} ${n === 1 ? "place" : "places"} found`;

  if (n === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="hand">Hmm, nothing here…</span>
        <p>${state.savedOnly ? "You haven't saved any places yet — tap the heart on a card." : "Try another month or category, or clear the search."}</p>
        <button type="button" class="btn btn-outline btn-sm" id="reset-filters">Reset filters</button>
      </div>`;
    document.getElementById("reset-filters").addEventListener("click", resetFilters);
  } else {
    grid.innerHTML = currentList.map((place) => placeCard(place, `#place=${place.id}`)).join("");
  }
  updateMarkers();
}

function resetFilters() {
  Object.assign(state, { category: "all", month: 0, search: "", savedOnly: false });
  searchInput.value = "";
  monthSelect.value = "0";
  render();
}

// ---------- filter events ----------

countryButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    state.country = btn.dataset.country;
    render();
    fitMap();
  })
);
categoryBox.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-category]");
  if (!btn) return;
  state.category = btn.dataset.category;
  render();
});
let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value;
    render();
  }, 150);
});
monthSelect.addEventListener("change", () => {
  state.month = Number(monthSelect.value);
  render();
});
savedToggle.addEventListener("click", () => {
  state.savedOnly = !state.savedOnly;
  render();
});

bindFavButtons(grid);
document.addEventListener("favoriteschange", () => {
  if (state.savedOnly) render();
});

// open the dialog from a card
grid.addEventListener("click", (event) => {
  const link = event.target.closest("[data-open]");
  if (!link) return;
  event.preventDefault();
  openPlace(link.dataset.open);
});

// highlight the pin when hovering a card
grid.addEventListener("mouseover", (event) => {
  const card = event.target.closest(".place-card");
  setActiveMarker(card ? card.dataset.id : null);
});
grid.addEventListener("mouseleave", () => setActiveMarker(null));

document.addEventListener("destinationchange", (event) => {
  state.country = event.detail;
  render();
  fitMap();
});

// ---------- map (Leaflet + OpenStreetMap tiles) ----------

let map = null;
const markers = new Map();

function initMap() {
  if (!window.L) {
    document.getElementById("map").innerHTML = '<p style="padding:24px">The map could not be loaded.</p>';
    return;
  }
  map = L.map("map", { scrollWheelZoom: false, zoomControl: true, worldCopyJump: true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // scroll-zoom only after the user clicks the map, so the page still scrolls normally
  map.on("click", () => map.scrollWheelZoom.enable());
  map.on("mouseout", () => map.scrollWheelZoom.disable());

  PLACES.forEach((place) => {
    const marker = L.marker([place.lat, place.lng], {
      title: place.name,
      icon: L.divIcon({ className: "", html: `<div class="pin ${place.country}"></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] }),
    });
    marker.bindPopup(
      `<div class="map-popup">
        <img src="${photoUrl(place.photos[0], 500)}" alt="">
        <strong>${escapeHtml(place.name)}</strong>
        <span>${escapeHtml(place.region)} · ${COUNTRY[place.country].name}</span>
        <button type="button" data-popup-open="${place.id}">See details</button>
      </div>`
    );
    markers.set(place.id, marker);
  });

  // "See details" buttons inside popups
  document.getElementById("map").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-popup-open]");
    if (btn) openPlace(btn.dataset.popupOpen);
  });

  updateMarkers();
  fitMap();

  // On phones the map starts hidden (size 0), so re-fit it the first time it becomes visible
  let wasHidden = document.getElementById("map").offsetWidth === 0;
  new ResizeObserver(([entry]) => {
    const hidden = entry.contentRect.width === 0;
    if (wasHidden && !hidden) {
      map.invalidateSize();
      if (!flyingToPlace) fitMap();
    }
    wasHidden = hidden;
  }).observe(document.getElementById("map"));
}

let flyingToPlace = false;

function updateMarkers() {
  if (!map) return;
  const visible = new Set(currentList.map((place) => place.id));
  markers.forEach((marker, id) => {
    if (visible.has(id)) marker.addTo(map);
    else marker.remove();
  });
}

function fitMap() {
  if (!map) return;
  const list = currentList.length ? currentList : PLACES;
  const bounds = L.latLngBounds(list.map((place) => [place.lat, place.lng]));
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
}

function setActiveMarker(id) {
  markers.forEach((marker, key) => {
    const el = marker.getElement()?.querySelector(".pin");
    if (el) el.classList.toggle("active", key === id);
    if (key === id) marker.setZIndexOffset(1000);
    else marker.setZIndexOffset(0);
  });
}

function showOnMap(id) {
  const place = findPlace(id);
  if (!map || !place) return;
  if (window.matchMedia("(max-width: 1020px)").matches) setMapOpen(true);
  else document.getElementById("map-wrap").scrollIntoView({ behavior: "smooth", block: "nearest" });
  // make sure the marker is visible even if filters hid it
  markers.get(id).addTo(map);
  flyingToPlace = true;
  map.invalidateSize();
  map.flyTo([place.lat, place.lng], 10, { duration: 1.2 });
  map.once("moveend", () => {
    flyingToPlace = false;
    markers.get(id).openPopup();
  });
}

// mobile: full-screen map toggle
const mapToggle = document.getElementById("map-toggle");
function setMapOpen(open) {
  document.body.classList.toggle("map-open", open);
  mapToggle.innerHTML = `${icon(open ? "layers" : "map")} <span>${open ? "Show list" : "Show map"}</span>`;
  if (map && open) {
    setTimeout(() => {
      map.invalidateSize();
      if (!flyingToPlace) fitMap();
    }, 50);
  }
}
mapToggle.addEventListener("click", () => setMapOpen(!document.body.classList.contains("map-open")));

// ---------- place dialog ----------

const dialog = document.getElementById("place-dialog");
let openId = null;

function monthsStrip(best) {
  return MONTHS.map((m, i) => `<span class="${best.includes(i + 1) ? "on" : ""}" title="${m}">${m[0]}</span>`).join("");
}

function photoCredit(key) {
  const photo = getPhoto(key);
  return `${escapeHtml(photo.caption)} — <a href="${photo.page}" target="_blank" rel="noopener">${escapeHtml(photo.author)}</a>, ${photo.license}`;
}

function openPlace(id) {
  const place = findPlace(id);
  if (!place) return;
  openId = id;
  const saved = isFavorite(id);
  const lang = place.country === "korea" ? "ko" : "mn";
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  dialog.innerHTML = `
    <button type="button" class="icon-btn dialog-close" aria-label="Close">${icon("x")}</button>
    <div class="dialog-grid">
      <div class="dialog-media">
        <img class="main-photo" src="${photoUrl(place.photos[0], 1280)}" alt="${escapeHtml(getPhoto(place.photos[0]).caption)}">
        ${
          place.photos.length > 1
            ? `<div class="thumbs">${place.photos
                .map(
                  (key, i) => `<button type="button" data-photo="${key}" aria-pressed="${i === 0}" aria-label="Show photo ${i + 1}">
                    <img src="${photoUrl(key, 330)}" alt=""></button>`
                )
                .join("")}</div>`
            : ""
        }
        <p class="credit">${photoCredit(place.photos[0])}</p>
      </div>
      <div class="dialog-body">
        <div class="tags">
          <span class="tag ${place.country}">${COUNTRY[place.country].name}</span>
          <span class="tag">${CATEGORIES[place.category]}</span>
        </div>
        <h2 id="dialog-title">${escapeHtml(place.name)}</h2>
        <p class="local-name" lang="${lang}">${escapeHtml(place.local)}</p>
        <p>${escapeHtml(place.about)}</p>
        <div class="note"><small>Local tip</small>${escapeHtml(place.tip)}</div>
        <dl class="facts">
          <div>${icon("map-pin")}<dt>Where</dt><dd>${escapeHtml(place.region)}, ${COUNTRY[place.country].name}</dd></div>
          <div>${icon("clock")}<dt>Time needed</dt><dd>${escapeHtml(place.time)}</dd></div>
          <div>${icon("compass")}<dt>Getting there</dt><dd>${escapeHtml(place.getThere)}</dd></div>
        </dl>
        <span class="field-label">Best time to visit</span>
        <div class="months" aria-label="Best months">${monthsStrip(place.best)}</div>
        ${(() => {
          const trips = tripsWithPlace(place.id);
          return trips.length
            ? `<div class="in-trips"><span class="field-label">Part of these trip plans</span><div class="chips">${trips
                .map((t) => `<a class="chip" href="trip.html?id=${t.id}">${icon("compass")} ${escapeHtml(t.name)} · ${t.days} days</a>`)
                .join("")}</div></div>`
            : "";
        })()}
        <div class="dialog-actions">
          <button type="button" class="btn btn-primary btn-sm" data-dialog-fav aria-pressed="${saved}">
            ${icon("heart")} <span>${saved ? "Saved to my trip" : "Save to my trip"}</span>
          </button>
          <button type="button" class="btn btn-outline btn-sm" data-dialog-map>${icon("map")} Show on map</button>
          <a class="btn btn-outline btn-sm" href="${mapsLink}" target="_blank" rel="noopener">${icon("external-link")} Google Maps</a>
        </div>
        <nav class="dialog-nav" aria-label="Other places">
          <button type="button" data-step="-1">${icon("arrow-left")} Previous</button>
          <button type="button" data-step="1">Next ${icon("arrow-right")}</button>
        </nav>
      </div>
    </div>`;

  if (!dialog.open) dialog.showModal();
  dialog.querySelector(".dialog-body").scrollTop = 0;
  history.replaceState(null, "", `#place=${id}`);
}

function closeDialog() {
  if (dialog.open) dialog.close();
}

dialog.addEventListener("close", () => {
  openId = null;
  history.replaceState(null, "", window.location.pathname + window.location.search);
});

// click on the dark backdrop closes the dialog
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    closeDialog();
    return;
  }
  if (event.target.closest(".dialog-close")) closeDialog();

  const thumb = event.target.closest("[data-photo]");
  if (thumb) {
    dialog.querySelector(".main-photo").src = photoUrl(thumb.dataset.photo, 1280);
    dialog.querySelector(".main-photo").alt = getPhoto(thumb.dataset.photo).caption;
    dialog.querySelector(".credit").innerHTML = photoCredit(thumb.dataset.photo);
    dialog.querySelectorAll("[data-photo]").forEach((b) => b.setAttribute("aria-pressed", String(b === thumb)));
  }

  const favBtn = event.target.closest("[data-dialog-fav]");
  if (favBtn) {
    const added = toggleFavorite(openId);
    favBtn.setAttribute("aria-pressed", String(added));
    favBtn.querySelector("span").textContent = added ? "Saved to my trip" : "Save to my trip";
    toast(added ? "Saved to My trip ♥" : "Removed from My trip");
  }

  if (event.target.closest("[data-dialog-map]")) {
    const id = openId;
    closeDialog();
    showOnMap(id);
  }

  const step = event.target.closest("[data-step]");
  if (step) {
    const list = currentList.some((p) => p.id === openId) ? currentList : PLACES;
    const index = list.findIndex((p) => p.id === openId);
    const next = list[(index + Number(step.dataset.step) + list.length) % list.length];
    openPlace(next.id);
  }
});

// keyboard: arrows move between places while the dialog is open
dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") dialog.querySelector('[data-step="1"]')?.click();
  if (event.key === "ArrowLeft") dialog.querySelector('[data-step="-1"]')?.click();
});

// ---------- start ----------

render();
initMap();

function openFromHash() {
  const match = window.location.hash.match(/place=([\w-]+)/);
  if (match && findPlace(match[1]) && match[1] !== openId) openPlace(match[1]);
}
openFromHash();
window.addEventListener("hashchange", openFromHash);
if (window.location.hash === "#map") {
  if (window.matchMedia("(max-width: 1020px)").matches) setMapOpen(true);
  else document.getElementById("explore-layout").scrollIntoView();
}
