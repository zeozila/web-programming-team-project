import { initPage, getDestination, toast, escapeHtml, COUNTRY } from "../lib/app.js";
import { icon } from "../lib/icons.js";
import { PHRASES, PHRASE_GROUPS } from "../data/phrases.js";
import { speak, canSpeak } from "../lib/speech.js";
import { load, save } from "../lib/store.js";

initPage("phrasebook");

const LANG_NAME = { ko: "Korean", mn: "Mongolian" };

const tabs = document.getElementById("group-tabs");
const grid = document.getElementById("phrase-grid");
const search = document.getElementById("phrase-search");
const hint = document.getElementById("phrase-hint");

const groupFromHash = window.location.hash.slice(1);
let group = PHRASE_GROUPS[groupFromHash] ? groupFromHash : "all";

// the language of the country you're visiting comes first
const mainLang = () => COUNTRY[getDestination()].lang;
const otherLang = () => (mainLang() === "ko" ? "mn" : "ko");

tabs.innerHTML = [["all", "All"], ...Object.entries(PHRASE_GROUPS)]
  .map(([key, label]) => `<button type="button" role="tab" data-group="${key}" aria-selected="${key === group}">${label}</button>`)
  .join("");

function phraseLine(phrase, lang, isMain) {
  const text = phrase[lang];
  const rom = phrase[`${lang}Rom`];
  return `
    <div class="line ${isMain ? "" : "other"}">
      <div>
        <div class="main" lang="${lang}"><span class="lang-flag ${lang}">${lang.toUpperCase()}</span>${escapeHtml(text)}</div>
        <div class="rom">${escapeHtml(rom)}</div>
      </div>
      <div class="btns">
        <button type="button" class="icon-btn" data-say="${escapeHtml(text)}" data-lang="${lang}" aria-label="Listen in ${LANG_NAME[lang]}">${icon("volume-2")}</button>
        ${isMain ? `<button type="button" class="icon-btn" data-copy="${escapeHtml(text)}" aria-label="Copy">${icon("copy")}</button>` : ""}
      </div>
    </div>`;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const list = PHRASES.filter((p) => {
    if (group !== "all" && p.group !== group) return false;
    if (!query) return true;
    return [p.en, p.ko, p.koRom, p.mn, p.mnRom].join(" ").toLowerCase().includes(query);
  });

  tabs.querySelectorAll("[data-group]").forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.group === group)));
  hint.textContent = `${list.length} phrases · ${LANG_NAME[mainLang()]} first because you're going to ${COUNTRY[getDestination()].name}. Switch the destination at the top to flip it.`;

  grid.innerHTML = list.length
    ? list
        .map(
          (p) => `
      <article class="phrase">
        <span class="en">${escapeHtml(p.en)}</span>
        ${phraseLine(p, mainLang(), true)}
        ${phraseLine(p, otherLang(), false)}
      </article>`
        )
        .join("")
    : `<div class="empty-state"><span class="hand">No phrases found</span><p>Try a shorter word.</p></div>`;
}

tabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-group]");
  if (!tab) return;
  group = tab.dataset.group;
  history.replaceState(null, "", group === "all" ? window.location.pathname : `#${group}`);
  render();
});
search.addEventListener("input", render);

function say(text, lang) {
  if (lang === "mn" && !canSpeak("mn")) {
    toast("Your device has no Mongolian voice — follow the romanization instead.");
    return;
  }
  if (!speak(text, lang)) toast("Sorry, your browser can't play audio for this.");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied — paste it in a chat or show it to someone");
  } catch {
    toast("Couldn't copy, sorry");
  }
}

grid.addEventListener("click", (event) => {
  const sayBtn = event.target.closest("[data-say]");
  if (sayBtn) say(sayBtn.dataset.say, sayBtn.dataset.lang);
  const copyBtn = event.target.closest("[data-copy]");
  if (copyBtn) copyText(copyBtn.dataset.copy);
});

// ---------- flashcards ----------

const card = document.getElementById("flashcard");
let current = null;

const knownKey = () => `known.${mainLang()}`;
const getKnown = () => load(knownKey(), []);

function updateProgress() {
  const known = getKnown().length;
  const total = PHRASES.length;
  document.getElementById("practice-bar").style.width = `${(known / total) * 100}%`;
  document.getElementById("practice-count").textContent = `${known} of ${total} learned`;
  document.getElementById("practice-lang").textContent = LANG_NAME[mainLang()];
}

function nextCard() {
  const known = getKnown();
  let pool = PHRASES.filter((p) => !known.includes(p.en));
  if (!pool.length) {
    toast("You learned every phrase! Starting a review round.");
    pool = PHRASES;
  }
  let pick = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1 && pick === current) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
  current = pick;

  const lang = mainLang();
  card.classList.remove("flipped");
  // change the text halfway through the flip-back so the answer doesn't flash
  setTimeout(() => {
    document.getElementById("card-front").textContent = current.en;
    document.getElementById("card-back-label").textContent = LANG_NAME[lang];
    document.getElementById("card-back").textContent = current[lang];
    document.getElementById("card-back").lang = lang;
    document.getElementById("card-back-rom").textContent = current[`${lang}Rom`];
  }, 150);
  updateProgress();
}

card.addEventListener("click", () => card.classList.toggle("flipped"));
document.getElementById("card-again").addEventListener("click", nextCard);
document.getElementById("card-listen").addEventListener("click", () => current && say(current[mainLang()], mainLang()));
document.getElementById("card-known").addEventListener("click", () => {
  const known = getKnown();
  if (current && !known.includes(current.en)) {
    known.push(current.en);
    save(knownKey(), known);
  }
  nextCard();
});
document.getElementById("practice-reset").addEventListener("click", () => {
  save(knownKey(), []);
  toast("Progress reset");
  nextCard();
});

document.addEventListener("destinationchange", () => {
  render();
  nextCard();
});

render();
nextCard();
