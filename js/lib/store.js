// Small wrapper around localStorage.
// Some browsers block storage (private mode, strict settings), so every call is guarded.

const PREFIX = "sb.";

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or disabled — the site still works, it just won't remember
  }
}

// ----- favourites ("My trip") -----

export function getFavorites() {
  const list = load("favorites", []);
  return Array.isArray(list) ? list : [];
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id) {
  const list = getFavorites();
  const index = list.indexOf(id);
  if (index === -1) list.push(id);
  else list.splice(index, 1);
  save("favorites", list);
  document.dispatchEvent(new CustomEvent("favoriteschange", { detail: list }));
  return index === -1;
}
