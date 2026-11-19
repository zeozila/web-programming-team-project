// Trip reviews.
// With Supabase configured (js/lib/config.js) everyone shares the same reviews through its REST API.
// Without it, reviews are kept in this browser's localStorage so the feature still works.

import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { load, save } from "./store.js";

export const isShared = Boolean(SUPABASE_URL && SUPABASE_KEY);

const TABLE = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/reviews`;

function headers(extra = {}) {
  const h = { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...extra };
  // legacy "anon" keys are JWTs and also go in the Authorization header
  if (SUPABASE_KEY.startsWith("eyJ")) h.Authorization = `Bearer ${SUPABASE_KEY}`;
  return h;
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.status === 204 ? null : await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function localReviews() {
  const list = load("reviews", []);
  return Array.isArray(list) ? list : [];
}

/** Newest first. */
export async function getReviews(tripId) {
  if (!isShared) {
    return localReviews()
      .filter((r) => r.trip_id === tripId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const params = new URLSearchParams({
    select: "id,trip_id,name,rating,comment,created_at",
    trip_id: `eq.${tripId}`,
    order: "created_at.desc",
    limit: "100",
  });
  return request(`${TABLE}?${params}`, { headers: headers() });
}

/** { tripId: { average, count } } for the trip cards. */
export async function getRatingSummary() {
  let rows;
  if (!isShared) rows = localReviews();
  else rows = await request(`${TABLE}?select=trip_id,rating&limit=2000`, { headers: headers() });

  const summary = {};
  rows.forEach(({ trip_id, rating }) => {
    summary[trip_id] ??= { total: 0, count: 0 };
    summary[trip_id].total += rating;
    summary[trip_id].count += 1;
  });
  Object.values(summary).forEach((s) => (s.average = s.total / s.count));
  return summary;
}

export async function addReview({ tripId, name, rating, comment }) {
  const review = {
    trip_id: tripId,
    name: name.trim().slice(0, 40),
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    comment: comment.trim().slice(0, 600),
  };

  if (!isShared) {
    const saved = { ...review, id: Date.now(), created_at: new Date().toISOString() };
    save("reviews", [...localReviews(), saved]);
    return saved;
  }
  const [saved] = await request(TABLE, {
    method: "POST",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(review),
  });
  return saved;
}
