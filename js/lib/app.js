// Shared setup for every page: header, footer, theme, destination switch and toasts.

import { icon } from "./icons.js";
import { load, save, getFavorites } from "./store.js";

const NAV = [
  { href: "index.html", label: "Home", key: "home" },
  { href: "explore.html", label: "Explore", key: "explore" },
  { href: "phrasebook.html", label: "Phrasebook", key: "phrasebook" },
  { href: "planner.html", label: "Planner", key: "planner" },
  { href: "quiz.html", label: "Quiz", key: "quiz" },
  { href: "about.html", label: "About", key: "about" },
];

export const REPO_URL = "https://github.com/zeozila/web-programming-team-project";

export const COUNTRY = {
  korea: { name: "Korea", capital: "Seoul", currency: "KRW", lang: "ko", other: "mongolia" },
  mongolia: { name: "Mongolia", capital: "Ulaanbaatar", currency: "MNT", lang: "mn", other: "korea" },
};

// ----- destination (which country the visitor is travelling to) -----

export function getDestination() {
  const value = load("destination", "mongolia");
  return value === "korea" ? "korea" : "mongolia";
}

export function setDestination(country) {
  if (!COUNTRY[country] || country === getDestination()) return;
  save("destination", country);
  applyDestination();
  document.dispatchEvent(new CustomEvent("destinationchange", { detail: country }));
}

function applyDestination() {
  const dest = getDestination();
  document.documentElement.dataset.dest = dest;
  document.querySelectorAll("[data-dest-btn]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.destBtn === dest));
  });
}

// ----- light / dark theme -----

function preferredTheme() {
  const saved = load("theme", null);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.querySelector(".theme-toggle");
  if (btn) {
    btn.innerHTML = icon(theme === "dark" ? "sun" : "moon");
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
}

// ----- header & footer -----

const LOGO = `
  <svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="var(--blue)"/>
    <path d="M1 16a15 15 0 0 1 30 0z" fill="var(--red)"/>
    <path d="M9 22v-4.2c0-.5.2-.9.6-1.2L16 12l6.4 4.6c.4.3.6.7.6 1.2V22z" fill="#fff"/>
    <rect x="14.6" y="18" width="2.8" height="4" fill="var(--blue)"/>
  </svg>`;

function headerHtml(active) {
  const links = NAV.map(
    (item) =>
      `<a href="${item.href}"${item.key === active ? ' aria-current="page"' : ""}>${item.label}</a>`
  ).join("");

  return `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="container header-inner">
      <a class="logo" href="index.html" aria-label="SeoulBaatar home">
        ${LOGO}<span class="logo-text">Seoul<span>Baatar</span></span>
      </a>
      <nav class="main-nav" id="main-nav" aria-label="Main">${links}</nav>
      <div class="header-tools">
        <div class="dest-switch" role="group" aria-label="Where are you going?">
          <span class="dest-label">Going to</span>
          <button type="button" data-dest-btn="korea" aria-pressed="false">Korea</button>
          <button type="button" data-dest-btn="mongolia" aria-pressed="false">Mongolia</button>
        </div>
        <a class="icon-btn trip-link" href="planner.html#my-trip" aria-label="My saved places">
          ${icon("heart")}<span class="badge" id="fav-count" hidden>0</span>
        </a>
        <button type="button" class="icon-btn theme-toggle" aria-label="Switch theme"></button>
        <button type="button" class="icon-btn menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">
          ${icon("menu")}
        </button>
      </div>
    </div>`;
}

function footerHtml() {
  const year = new Date().getFullYear();
  return `
    <div class="footer-pattern" aria-hidden="true"></div>
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="logo" href="index.html">${LOGO}<span class="logo-text">Seoul<span>Baatar</span></span></a>
        <p>A two-way travel guide for Korea and Mongolia. Made by four students who live between Seoul and Ulaanbaatar.</p>
      </div>
      <div>
        <h3>Explore</h3>
        <a href="explore.html?country=korea">Places in Korea</a>
        <a href="explore.html?country=mongolia">Places in Mongolia</a>
        <a href="explore.html#map">Map</a>
      </div>
      <div>
        <h3>Travel tools</h3>
        <a href="phrasebook.html">Phrasebook</a>
        <a href="planner.html">Trip planner</a>
        <a href="quiz.html">Culture quiz</a>
      </div>
      <div>
        <h3>Project</h3>
        <a href="about.html">About &amp; team</a>
        <a href="docs/proposal.pdf" target="_blank" rel="noopener">Project proposal (PDF)</a>
        <a href="${REPO_URL}" target="_blank" rel="noopener">Source code on GitHub</a>
        <a href="about.html#credits">Photo credits</a>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© ${year} Team 6 · Web Programming</span>
      <span>Photos: Wikimedia Commons · Maps: © OpenStreetMap contributors</span>
    </div>`;
}

function updateFavCount() {
  const badge = document.getElementById("fav-count");
  if (!badge) return;
  const count = getFavorites().length;
  badge.textContent = count;
  badge.hidden = count === 0;
}

function setupHeader(header) {
  const menuBtn = header.querySelector(".menu-toggle");
  const nav = header.querySelector(".main-nav");

  menuBtn.addEventListener("click", () => {
    const open = !header.classList.contains("menu-open");
    header.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.innerHTML = icon(open ? "x" : "menu");
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) header.classList.remove("menu-open");
  });

  header.querySelectorAll("[data-dest-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setDestination(btn.dataset.destBtn);
      toast(`Showing travel info for ${COUNTRY[btn.dataset.destBtn].name}`);
    });
  });

  header.querySelector(".theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    save("theme", next);
    applyTheme(next);
  });

  // solid header once the page is scrolled (matters on pages with a photo hero)
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ----- toast messages -----

let toastTimer;
export function toast(message) {
  let box = document.querySelector(".toast");
  if (!box) {
    box = document.createElement("div");
    box.className = "toast";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    document.body.append(box);
  }
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("show"), 2600);
}

// ----- small helpers used by several pages -----

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatNumber(value, digits = 0) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// <span data-icon="plane"></span> in the HTML becomes an SVG icon
export function fillIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
    el.removeAttribute("data-icon");
  });
}

// Call this once at the top of every page script.
export function initPage(active) {
  applyTheme(preferredTheme());
  applyDestination();

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = headerHtml(active);
    setupHeader(header);
    applyTheme(document.documentElement.dataset.theme);
    applyDestination();
  }

  const footer = document.getElementById("site-footer");
  if (footer) footer.innerHTML = footerHtml();

  fillIcons();
  updateFavCount();
  document.addEventListener("favoriteschange", updateFavCount);

  // reveal-on-scroll for elements marked with .reveal
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => observer.observe(el));
  } else {
    items.forEach((el) => el.classList.add("visible"));
  }
}
