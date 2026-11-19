import { initPage, getDestination } from "../lib/app.js";
import { TRIPS } from "../data/trips.js";
import { tripCard, handleBrokenImages } from "../lib/cards.js";
import { getRatingSummary } from "../lib/reviews.js";

initPage("trips");
handleBrokenImages();

const params = new URLSearchParams(window.location.search);
const state = {
  country: ["korea", "mongolia", "all"].includes(params.get("country")) ? params.get("country") : getDestination(),
  length: "any",
};
let ratings = {};

const grid = document.getElementById("trip-grid");

function matchesLength(days) {
  if (state.length === "short") return days <= 3;
  if (state.length === "mid") return days >= 4 && days <= 5;
  if (state.length === "long") return days >= 6;
  return true;
}

function render() {
  const list = TRIPS.filter((trip) => (state.country === "all" || trip.country === state.country) && matchesLength(trip.days));

  document.querySelectorAll("[data-country]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.country === state.country)));
  document.querySelectorAll("[data-length]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.length === state.length)));
  document.getElementById("trip-count").textContent = `${list.length} ${list.length === 1 ? "trip" : "trips"}`;

  grid.innerHTML = list.length
    ? list.map((trip) => tripCard(trip, ratings[trip.id])).join("")
    : `<div class="empty-state"><span class="hand">No trips that long here</span><p>Try another length.</p></div>`;
}

document.getElementById("trip-country").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-country]");
  if (!btn) return;
  state.country = btn.dataset.country;
  render();
});
document.getElementById("trip-length").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-length]");
  if (!btn) return;
  state.length = btn.dataset.length;
  render();
});
document.addEventListener("destinationchange", (event) => {
  state.country = event.detail;
  render();
});

render();

// ratings arrive a moment later; the cards are redrawn when they do
getRatingSummary()
  .then((summary) => {
    ratings = summary;
    render();
  })
  .catch(() => {});
