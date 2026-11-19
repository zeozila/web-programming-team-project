import { initPage, getDestination, setDestination, COUNTRY, escapeHtml, formatNumber } from "../lib/app.js";
import { photoUrl, getPhoto } from "../data/photos.js";
import { PLACES } from "../data/places.js";
import { placeCard, tripCard, bindFavButtons, handleBrokenImages } from "../lib/cards.js";
import { TRIPS } from "../data/trips.js";
import { getRatingSummary } from "../lib/reviews.js";
import { getRates } from "../lib/api.js";

initPage("home");
handleBrokenImages();

// ---------- content that changes with the destination ----------

const HERO = {
  mongolia: {
    hello: "Сайн байна уу!",
    title: "Land of the <em>eternal blue sky</em>",
    text: "Gers under the stars, singing sand dunes and the friendliest nomads you'll ever meet — only three and a half hours from Seoul.",
    slides: ["ger", "khongor", "terelj", "naadam"],
    cta: "eagle",
  },
  korea: {
    hello: "안녕하세요!",
    title: "Palaces, beaches &amp; <em>late-night street food</em>",
    text: "From Seoul's royal palaces to Jeju's volcanoes — everything you need for your first trip to Korea, in one place.",
    slides: ["seoulsky", "guards", "seongsan", "busan"],
    cta: "seoulnight",
  },
};

const FOOD = {
  mongolia: {
    title: "Two dishes you have to try",
    text: "Mongolian food is simple and filling — mostly meat, flour and dairy, made for long cold winters on the steppe. You'll find both of these in every guanz (canteen).",
    dishes: [
      { photo: "buuz", name: "Buuz", local: "Бууз", text: "Steamed dumplings filled with mutton or beef. Everyone makes hundreds of them for Tsagaan Sar." },
      { photo: "khuushuur", name: "Khuushuur", local: "Хуушуур", text: "Crispy fried meat pastries — the classic Naadam snack. Eat them hot with your hands." },
    ],
  },
  korea: {
    title: "Two dishes you have to try",
    text: "Korean meals come with free side dishes (banchan) that get refilled. Don't be shy about asking for more kimchi.",
    dishes: [
      { photo: "bibimbap", name: "Dolsot bibimbap", local: "돌솥비빔밥", text: "Rice, vegetables, egg and gochujang in a sizzling stone bowl. Mix it well and wait for the crispy bottom." },
      { photo: "kbbq", name: "Korean barbecue", local: "삼겹살", text: "Grill pork belly at your table and wrap it in lettuce with garlic and ssamjang." },
    ],
  },
};

// ---------- hero slideshow ----------

const slidesBox = document.getElementById("hero-slides");
const dotsBox = document.getElementById("hero-dots");
const creditBox = document.getElementById("hero-credit");
let slideIndex = 0;
let slideTimer;

function creditText(key) {
  const photo = getPhoto(key);
  if (!photo) return "";
  return `${escapeHtml(photo.caption)} · Photo: <a href="${photo.page}" target="_blank" rel="noopener">${escapeHtml(photo.author)}</a>, ${photo.license}`;
}

function showSlide(index) {
  const images = slidesBox.querySelectorAll("img");
  if (!images.length) return;
  slideIndex = (index + images.length) % images.length;
  images.forEach((img, i) => img.classList.toggle("active", i === slideIndex));
  dotsBox.querySelectorAll("button").forEach((dot, i) => dot.setAttribute("aria-current", String(i === slideIndex)));
  creditBox.innerHTML = creditText(images[slideIndex].dataset.key);
}

function startSlides() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    if (!document.hidden) showSlide(slideIndex + 1);
  }, 6500);
}

function renderHero(dest) {
  const data = HERO[dest];
  document.getElementById("hero-hello").textContent = data.hello;
  document.getElementById("hero-hello").lang = COUNTRY[dest].lang;
  document.getElementById("hero-title").innerHTML = data.title;
  document.getElementById("hero-text").textContent = data.text;
  document.getElementById("hero-explore").href = `explore.html?country=${dest}`;

  slidesBox.innerHTML = data.slides
    .map(
      (key, i) => `<img src="${photoUrl(key, 1920)}" data-key="${key}" alt="${escapeHtml(getPhoto(key).caption)}"
        ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>`
    )
    .join("");
  dotsBox.innerHTML = data.slides
    .map((key, i) => `<button type="button" aria-label="Photo ${i + 1}: ${escapeHtml(getPhoto(key).caption)}"></button>`)
    .join("");
  dotsBox.querySelectorAll("button").forEach((dot, i) =>
    dot.addEventListener("click", () => {
      showSlide(i);
      startSlides();
    })
  );

  // wait a tick so the fade-in transition runs on the first photo too
  requestAnimationFrame(() => requestAnimationFrame(() => showSlide(0)));
  startSlides();
}

// ---------- live clocks & exchange rate ----------

const clockFormat = (timeZone) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", weekday: "short" });
const seoulClock = clockFormat("Asia/Seoul");
const ubClock = clockFormat("Asia/Ulaanbaatar");

function tick() {
  const now = new Date();
  document.getElementById("time-seoul").textContent = seoulClock.format(now);
  document.getElementById("time-ub").textContent = ubClock.format(now);
}
tick();
setInterval(tick, 15000);

let rates = null;
function renderRate(dest) {
  const label = document.getElementById("rate-label");
  const value = document.getElementById("rate-value");
  if (!rates) return;
  if (dest === "mongolia") {
    label.textContent = "₩10,000 in tögrög";
    value.textContent = `₮${formatNumber((10000 * rates.rates.MNT) / rates.rates.KRW)}`;
  } else {
    label.textContent = "₮100,000 in won";
    value.textContent = `₩${formatNumber((100000 * rates.rates.KRW) / rates.rates.MNT)}`;
  }
  value.title = rates.live ? "Live rate" : "Approximate rate (offline)";
}
getRates().then((result) => {
  rates = result;
  renderRate(getDestination());
});

// ---------- top picks ----------

const picks = document.getElementById("picks");
bindFavButtons(picks);

function renderPicks(dest) {
  document.getElementById("picks-country").textContent = COUNTRY[dest].name;
  document.getElementById("picks-all").href = `explore.html?country=${dest}`;
  picks.innerHTML = PLACES.filter((place) => place.country === dest)
    .map((place) => placeCard(place))
    .join("");
}

function scrollPicks(direction) {
  const card = picks.querySelector(".place-card");
  const step = card ? card.offsetWidth + 20 : 300;
  picks.scrollBy({ left: direction * step * 2, behavior: "smooth" });
}
document.getElementById("picks-prev").addEventListener("click", () => scrollPicks(-1));
document.getElementById("picks-next").addEventListener("click", () => scrollPicks(1));

// ---------- trip plans ----------

const ratings = getRatingSummary();
function renderTrips(dest) {
  document.getElementById("trips-country").textContent = COUNTRY[dest].name;
  document.getElementById("trips-all").href = `trips.html?country=${dest}`;
  document.getElementById("home-trips").innerHTML = TRIPS.filter((trip) => trip.country === dest)
    .slice(0, 3)
    .map((trip) => tripCard(trip, ratings[trip.id]))
    .join("");
}

// ---------- food ----------

function renderFood(dest) {
  const data = FOOD[dest];
  document.getElementById("food-title").textContent = data.title;
  document.getElementById("food-text").textContent = data.text;
  document.getElementById("food-cards").innerHTML = data.dishes
    .map(
      (dish) => `
      <figure class="food-card">
        <img src="${photoUrl(dish.photo, 960)}" alt="${escapeHtml(getPhoto(dish.photo).caption)}" loading="lazy">
        <figcaption class="inner">
          <span class="local" lang="${COUNTRY[dest].lang}">${dish.local}</span>
          <h3>${dish.name}</h3>
          <p>${dish.text}</p>
        </figcaption>
      </figure>`
    )
    .join("");
}

// ---------- put it together ----------

function renderAll() {
  const dest = getDestination();
  renderHero(dest);
  renderPicks(dest);
  renderTrips(dest);
  renderFood(dest);
  renderRate(dest);
  document.getElementById("cta-photo").src = photoUrl(HERO[dest].cta, 1280);
}

// the cards are normal links; we just remember the choice before the page changes
document.querySelectorAll("[data-choose]").forEach((card) => {
  card.addEventListener("click", () => setDestination(card.dataset.choose));
});

document.addEventListener("destinationchange", renderAll);
renderAll();
