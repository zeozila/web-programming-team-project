// Trip reviews, saved in the browser with localStorage (like the saved places).

import { load, save } from "./store.js";

function allReviews() {
  const list = load("reviews", []);
  return Array.isArray(list) ? list : [];
}

/** Reviews for one trip, newest first. */
export function getReviews(tripId) {
  return allReviews()
    .filter((review) => review.trip_id === tripId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** { tripId: { average, count } } for the stars on the trip cards. */
export function getRatingSummary() {
  const summary = {};
  allReviews().forEach(({ trip_id, rating }) => {
    summary[trip_id] ??= { total: 0, count: 0 };
    summary[trip_id].total += rating;
    summary[trip_id].count += 1;
  });
  Object.values(summary).forEach((s) => (s.average = s.total / s.count));
  return summary;
}

export function addReview({ tripId, name, rating, comment }) {
  const review = {
    id: Date.now(),
    trip_id: tripId,
    name: name.trim().slice(0, 40),
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    comment: comment.trim().slice(0, 600),
    created_at: new Date().toISOString(),
  };
  save("reviews", [...allReviews(), review]);
  return review;
}
