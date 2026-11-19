// Suggested itineraries. These are plans we recommend, not tours we sell:
// the cost is an estimate built from our daily cost model plus the trip's extra transport.
//
// Each day can point at places from places.js (photo + map pin come from there)
// and/or extra stops that aren't on the Explore page (name + coordinates).

import { dailyTotal } from "./costs.js";

export const TRIPS = [
  // ---------- Mongolia ----------
  {
    id: "ub-weekend",
    country: "mongolia",
    name: "Ulaanbaatar & Terelj Weekend",
    days: 3,
    pace: "Easy",
    photo: "terelj",
    best: [5, 6, 7, 8, 9],
    highlights: ["Monks chanting at Gandan", "The giant Chinggis Khaan statue", "A night in a ger at Terelj"],
    summary:
      "The best short taste of Mongolia: one day in the capital, then out to the steppe and granite hills of Terelj for horse riding and a night in a ger. Perfect for a long weekend from Seoul.",
    plan: [
      {
        title: "Ulaanbaatar city day",
        places: ["sukhbaatar", "gandan", "zaisan"],
        text: "Start at Gandan Monastery around 9am for the chanting, then walk to Sükhbaatar Square and the State Department Store. Finish with sunset from Zaisan hill.",
        stay: "Hotel or guesthouse in Ulaanbaatar",
      },
      {
        title: "Chinggis Khaan Statue → Terelj",
        places: ["chinggis", "terelj"],
        text: "Drive east to the 40 m statue and walk out onto the horse's head. Continue to Terelj, see Turtle Rock and go horse riding in the valley.",
        stay: "Ger camp in Terelj",
      },
      {
        title: "Morning hike, back to the city",
        places: ["terelj"],
        text: "Hike up behind the camp for the view, have a slow breakfast and head back to Ulaanbaatar after lunch.",
        stay: "—",
      },
    ],
    included: ["All 3 days planned stop by stop", "Where to stay each night", "Getting from place to place", "Best time of day for each stop"],
    notIncluded: ["Flights to Mongolia", "Visa (check the rules for your passport)", "Travel insurance"],
    goodToKnow: [
      "Ger camps in Terelj are mostly open from May to September.",
      "Book a car with a driver for days 2–3 — your hotel can arrange it.",
      "Bring a warm layer: evenings outside the city are cold even in summer.",
    ],
    extras: { amount: 120000, label: "Car and driver for days 2–3, shared by 2–4 people" },
  },
  {
    id: "central",
    country: "mongolia",
    name: "Central Mongolia & the Old Capital",
    days: 5,
    pace: "Active",
    photo: "erdenezuu",
    best: [6, 7, 8, 9],
    highlights: ["Wild takhi horses at Hustai", "Erdene Zuu, the oldest monastery", "Orkhon Waterfall and nomad life"],
    summary:
      "A road trip into the green heart of Mongolia: wild horses, the ruins of Chinggis Khaan's capital Karakorum, and the Orkhon Valley where nomads have lived for thousands of years.",
    plan: [
      {
        title: "Ulaanbaatar → Hustai National Park",
        places: ["hustai"],
        text: "A two-hour drive west. Rest at camp, then go out in the evening when the takhi come down to drink.",
        stay: "Ger camp near Hustai",
      },
      {
        title: "Hustai → Kharkhorin",
        places: ["erdenezuu"],
        text: "A long drive across the steppe to Kharkhorin. Visit Erdene Zuu Monastery and the Kharkhorum Museum next door.",
        stay: "Ger camp in Kharkhorin",
      },
      {
        title: "Into the Orkhon Valley",
        places: ["orkhon"],
        text: "Off-road to the 20 m Orkhon Waterfall. Climb down to the bottom of the falls if the path is dry.",
        stay: "Ger camp or with a nomad family",
      },
      {
        title: "A day with herders",
        places: ["orkhon"],
        text: "Ride horses with a local family, help with the animals and try fresh airag (fermented mare's milk) and aaruul (dried curd).",
        stay: "Ger camp or with a nomad family",
      },
      {
        title: "Back to Ulaanbaatar",
        places: ["sukhbaatar"],
        text: "Most of the day is on the road. Stop for khuushuur at a roadside guanz on the way.",
        stay: "—",
      },
    ],
    included: ["All 5 days planned stop by stop", "Where to stay each night", "Driving times between stops", "What to eat and try on the way"],
    notIncluded: ["Flights to Mongolia", "Visa", "Travel insurance", "Tips for drivers and guides"],
    goodToKnow: [
      "Hire a jeep (or Russian van) with a driver — the roads to Orkhon are off-road.",
      "Bring cash in tögrög: cards rarely work outside Ulaanbaatar.",
      "Ask before taking photos of people, and step over (never on) the ger doorstep.",
    ],
    extras: { amount: 600000, label: "Jeep and driver for 5 days, shared by 3–4 people" },
  },
  {
    id: "gobi",
    country: "mongolia",
    name: "Gobi Desert Explorer",
    days: 5,
    pace: "Adventure",
    photo: "khongor",
    best: [5, 6, 9],
    highlights: ["Ice-filled gorge of Yolyn Am", "Singing dunes of Khongoryn Els", "Sunset at the Flaming Cliffs"],
    summary:
      "Fly south into the Gobi for canyons, camels and the biggest sand dunes in Mongolia, then watch the red cliffs where the first dinosaur eggs were found glow at sunset.",
    plan: [
      {
        title: "Fly to Dalanzadgad → Yolyn Am",
        stops: [
          { name: "Dalanzadgad", lat: 43.5708, lng: 104.425 },
          { name: "Yolyn Am (Eagle Valley)", lat: 43.4889, lng: 104.0656 },
        ],
        text: "A morning flight from Ulaanbaatar, then walk into the narrow Yolyn Am gorge, where ice can last into early summer.",
        stay: "Ger camp near Yolyn Am",
      },
      {
        title: "Drive to Khongoryn Els",
        places: ["khongor"],
        text: "Four to five hours across the desert. In the evening climb the dunes for sunset — it's steep, so go slowly.",
        stay: "Ger camp by the dunes",
      },
      {
        title: "Camels and herders",
        places: ["khongor"],
        text: "Ride a two-humped Bactrian camel with a local family and visit their ger. Free afternoon at the dunes.",
        stay: "Ger camp by the dunes",
      },
      {
        title: "Bayanzag, the Flaming Cliffs",
        places: ["bayanzag"],
        text: "Drive north to the red cliffs. Walk along the edge in the late afternoon when the colours are strongest.",
        stay: "Ger camp near Bayanzag",
      },
      {
        title: "Back to Dalanzadgad, fly to Ulaanbaatar",
        stops: [{ name: "Dalanzadgad", lat: 43.5708, lng: 104.425 }],
        text: "Drive back to the airport for the afternoon flight north.",
        stay: "—",
      },
    ],
    included: ["All 5 days planned stop by stop", "Where to stay each night", "Driving times in the desert", "Best light for photos at each stop"],
    notIncluded: ["Flights to Mongolia", "Visa", "Travel insurance", "Camel ride fee (pay the family directly)"],
    goodToKnow: [
      "Days are hot and nights are cold — pack for both.",
      "Bring sunglasses, a hat, sunscreen and plenty of water.",
      "Spring can be windy with dust storms; June and September are calmer.",
    ],
    extras: { amount: 1150000, label: "Return flight to Dalanzadgad + shared jeep and driver" },
  },
  {
    id: "khovsgol",
    country: "mongolia",
    name: "Lake Khövsgöl Escape",
    days: 5,
    pace: "Easy",
    photo: "khovsgol",
    best: [6, 7, 8],
    highlights: ["Crystal-clear 'Blue Pearl' lake", "Kayaking and taiga forest hikes", "Horse rides along the shore"],
    summary:
      "Slow days by Mongolia's clearest lake, surrounded by pine forest near the Russian border. Kayak, hike, ride horses — or just sit by the water and do nothing at all.",
    plan: [
      {
        title: "Fly to Mörön → Khatgal",
        stops: [
          { name: "Mörön", lat: 49.6342, lng: 100.1625 },
          { name: "Khatgal", lat: 50.4417, lng: 100.16 },
        ],
        text: "Fly north from Ulaanbaatar, then about two hours by car to Khatgal village at the south end of the lake.",
        stay: "Lakeside ger camp",
      },
      {
        title: "On the water",
        places: ["khovsgol"],
        text: "Rent a kayak or take a boat trip along the shore. The water is so clear you can see the bottom.",
        stay: "Lakeside ger camp",
      },
      {
        title: "Horses through the taiga",
        places: ["khovsgol"],
        text: "A half-day horse ride through the larch forest with a local guide.",
        stay: "Lakeside ger camp",
      },
      {
        title: "Free day by the lake",
        places: ["khovsgol"],
        text: "Hike to a viewpoint, try fishing or brave a (very cold) swim. Watch the sunset over the water.",
        stay: "Lakeside ger camp",
      },
      {
        title: "Back to Mörön, fly to Ulaanbaatar",
        stops: [{ name: "Mörön", lat: 49.6342, lng: 100.1625 }],
        text: "Drive back to Mörön for the flight to the capital.",
        stay: "—",
      },
    ],
    included: ["All 5 days planned", "Where to stay", "How to get from Mörön to the lake", "Activities to book on the spot"],
    notIncluded: ["Flights to Mongolia", "Visa", "Travel insurance", "Kayak and horse rental"],
    goodToKnow: [
      "The lake is near the taiga and nights can drop close to freezing even in July.",
      "Visiting in early March? The frozen lake hosts the Ice Festival.",
      "Mosquito repellent is a good idea in July.",
    ],
    extras: { amount: 700000, label: "Return flight to Mörön + transfer to Khatgal" },
  },
  {
    id: "altai",
    country: "mongolia",
    name: "Golden Eagles of the Altai",
    days: 6,
    pace: "Adventure",
    photo: "eagle",
    best: [7, 8, 9, 10],
    highlights: ["Golden Eagle Festival in Ölgii", "Staying with a Kazakh family", "Glaciers of Altai Tavan Bogd"],
    summary:
      "Fly to Mongolia's wild far west, where Kazakh eagle hunters still train golden eagles. Time it with the festival in early October, then head into the snowy Altai mountains.",
    plan: [
      {
        title: "Fly to Ölgii",
        stops: [{ name: "Ölgii", lat: 48.9683, lng: 89.9625 }],
        text: "A long flight west from Ulaanbaatar. Walk around town and try Kazakh food like beshbarmak.",
        stay: "Guesthouse in Ölgii",
      },
      {
        title: "Golden Eagle Festival, day 1",
        stops: [{ name: "Ölgii festival ground", lat: 48.97, lng: 89.98 }],
        text: "The opening parade of hunters on horseback, then the eagle-calling contests.",
        stay: "Guesthouse in Ölgii",
      },
      {
        title: "Golden Eagle Festival, day 2",
        stops: [{ name: "Ölgii festival ground", lat: 48.97, lng: 89.98 }],
        text: "Horse games, archery and a chance to meet the hunters and their eagles.",
        stay: "Guesthouse in Ölgii",
      },
      {
        title: "Into Altai Tavan Bogd",
        places: ["altai"],
        text: "A bumpy drive into the national park. Spend the night with a Kazakh herder family.",
        stay: "Ger with a Kazakh family",
      },
      {
        title: "Glacier hike",
        places: ["altai"],
        text: "Hike towards the glaciers below Khüiten, Mongolia's highest peak (4,374 m).",
        stay: "Ger with a Kazakh family",
      },
      {
        title: "Back to Ölgii, fly to Ulaanbaatar",
        stops: [{ name: "Ölgii", lat: 48.9683, lng: 89.9625 }],
        text: "Drive back to Ölgii for the flight east.",
        stay: "—",
      },
    ],
    included: ["All 6 days planned", "Where to stay", "Festival tips", "What to pack for the mountains"],
    notIncluded: ["Flights to Mongolia", "Visa", "Travel insurance", "Border zone permit (needed for the park — arrange it in Ölgii)"],
    goodToKnow: [
      "The festival is usually held on the first weekend of October — check the dates before booking flights.",
      "The park is next to the border, so you need a permit; local guesthouses can arrange it.",
      "Many people here speak Kazakh first — a few Kazakh words go a long way.",
    ],
    extras: { amount: 1500000, label: "Return flight to Ölgii + shared jeep and driver" },
  },

  // ---------- Korea ----------
  {
    id: "seoul",
    country: "korea",
    name: "Seoul in 3 Days",
    days: 3,
    pace: "Easy",
    photo: "seoulsky",
    best: [4, 5, 9, 10, 11],
    highlights: ["Royal palace and hanok alleys", "Street food at Gwangjang Market", "Sunset from N Seoul Tower"],
    summary:
      "The classic first visit to Seoul: palaces in the morning, street food at lunch and city lights at night. Everything is reachable by subway with a T-money card.",
    plan: [
      {
        title: "Palaces and hanok",
        places: ["gyeongbokgung", "bukchon", "cheonggyecheon"],
        text: "Rent a hanbok and enter Gyeongbokgung for free, catch the guard ceremony, then wander up through Bukchon. In the evening walk along Cheonggyecheon.",
        stay: "Hotel near Jongno or Myeongdong",
      },
      {
        title: "Markets and Namsan",
        places: ["gwangjang", "namsan"],
        text: "Eat your way through Gwangjang Market at lunch. In the late afternoon walk up Namsan and stay at N Seoul Tower for the sunset.",
        stay: "Hotel near Jongno or Myeongdong",
      },
      {
        title: "Modern Seoul",
        places: ["lotte"],
        text: "Go up Lotte World Tower and walk around Seokchon Lake. Spend your last evening in Hongdae or Myeongdong.",
        stay: "—",
      },
    ],
    included: ["All 3 days planned stop by stop", "Nearest subway station for each stop", "Where to eat", "Free-entry tips"],
    notIncluded: ["Flights to Korea", "Visa or K-ETA (check the rules for your passport)", "Travel insurance"],
    goodToKnow: [
      "Gyeongbokgung is closed on Tuesdays.",
      "Buy a T-money card at any convenience store and top it up with cash.",
      "Use Naver Map or KakaoMap — Google Maps directions don't work well in Korea.",
    ],
    extras: { amount: 0, label: "" },
  },
  {
    id: "busan",
    country: "korea",
    name: "Busan & Gyeongju",
    days: 4,
    pace: "Easy",
    photo: "haeundae",
    best: [4, 5, 6, 9, 10],
    highlights: ["Haeundae Beach and the Sky Capsule", "Colourful Gamcheon Culture Village", "Bulguksa Temple in Gyeongju"],
    summary:
      "Take the KTX south for beaches, seafood and Korea's ancient Silla capital. Busan is relaxed and by the sea, and Gyeongju is like an open-air museum.",
    plan: [
      {
        title: "KTX to Busan → Haeundae",
        places: ["haeundae"],
        text: "About 2.5 hours from Seoul by KTX. Spend the afternoon at Haeundae and ride the Sky Capsule along the coast.",
        stay: "Hotel in Haeundae",
      },
      {
        title: "Gamcheon and the old port",
        places: ["gamcheon"],
        text: "Wander the colourful alleys of Gamcheon with a stamp map, then eat fresh seafood at Jagalchi Market.",
        stay: "Hotel in Haeundae",
      },
      {
        title: "Day trip to Gyeongju",
        places: ["bulguksa"],
        text: "About an hour away. Visit Bulguksa in the morning, then rent a bike and ride between the royal tombs.",
        stay: "Hotel in Haeundae",
      },
      {
        title: "Beach morning, KTX back",
        places: ["haeundae"],
        text: "A last walk on the beach, then the train back to Seoul.",
        stay: "—",
      },
    ],
    included: ["All 4 days planned", "Train and bus tips", "Where to eat seafood", "Best photo spots"],
    notIncluded: ["Flights to Korea", "Visa or K-ETA", "Travel insurance"],
    goodToKnow: [
      "Book KTX tickets a few days ahead on weekends and holidays.",
      "July and August are hot, humid and crowded at the beach.",
      "Busan's subway also takes T-money.",
    ],
    extras: { amount: 120000, label: "KTX Seoul ⇄ Busan return" },
  },
  {
    id: "jeju",
    country: "korea",
    name: "Jeju Volcano Island",
    days: 4,
    pace: "Active",
    photo: "seongsan",
    best: [3, 4, 5, 9, 10],
    highlights: ["Sunrise on Seongsan Ilchulbong", "Hiking Hallasan, Korea's highest peak", "Haenyeo women divers"],
    summary:
      "A short flight from Seoul to Korea's volcanic island: sunrise over a crater in the sea, a big day hiking Hallasan, and black-stone coastlines in between.",
    plan: [
      {
        title: "Fly to Jeju",
        stops: [{ name: "Jeju City", lat: 33.4996, lng: 126.5312 }],
        text: "About an hour from Gimpo. Pick up a rental car or use the island buses, and explore the coast near Jeju City.",
        stay: "Hotel or guesthouse in Jeju City",
      },
      {
        title: "Sunrise at Seongsan Ilchulbong",
        places: ["seongsan"],
        text: "Climb up for sunrise (about 25 minutes), then watch the haenyeo divers near the base.",
        stay: "Guesthouse near Seongsan",
      },
      {
        title: "Hike Hallasan",
        places: ["hallasan"],
        text: "A full day on the Seongpanak trail to the crater lake at the top. Start early — the summit closes in the early afternoon.",
        stay: "Hotel in Jeju City",
      },
      {
        title: "Slow morning, fly back",
        stops: [{ name: "Jeju City", lat: 33.4996, lng: 126.5312 }],
        text: "Try Jeju black pork and tangerines before your flight.",
        stay: "—",
      },
    ],
    included: ["All 4 days planned", "Trail and reservation tips", "Where to stay", "What to eat on Jeju"],
    notIncluded: ["Flights to Korea", "Visa or K-ETA", "Travel insurance", "Car rental (international licence needed)"],
    goodToKnow: [
      "Hallasan summit hikes must be reserved online in advance.",
      "Jeju weather changes fast — bring a rain jacket.",
      "Driving needs an international driving permit; the island buses are a good alternative.",
    ],
    extras: { amount: 200000, label: "Return flight Seoul ⇄ Jeju + shared car rental" },
  },
  {
    id: "classic",
    country: "korea",
    name: "Classic Korea",
    days: 7,
    pace: "Active",
    photo: "jeonju",
    best: [4, 5, 10],
    highlights: ["Seoul's palaces and markets", "A night in a Jeonju hanok", "Gyeongju temples and Busan's coast"],
    summary:
      "One week from Seoul to Busan by train and bus: the capital, the home of bibimbap, the ancient Silla capital and the seaside — a full picture of Korea.",
    plan: [
      {
        title: "Seoul: palaces",
        places: ["gyeongbokgung", "bukchon"],
        text: "Gyeongbokgung (free in hanbok) and the hanok alleys of Bukchon.",
        stay: "Hotel in Seoul",
      },
      {
        title: "Seoul: markets and Namsan",
        places: ["gwangjang", "namsan"],
        text: "Lunch at Gwangjang Market, sunset at N Seoul Tower.",
        stay: "Hotel in Seoul",
      },
      {
        title: "KTX to Jeonju",
        places: ["jeonju"],
        text: "About 1 h 40 min by KTX. Eat Jeonju bibimbap and spend the night in a traditional hanok.",
        stay: "Hanok guesthouse in Jeonju",
      },
      {
        title: "Bus to Gyeongju",
        places: ["bulguksa"],
        text: "An express bus east to Gyeongju. Visit Bulguksa and the royal tombs.",
        stay: "Hotel in Gyeongju",
      },
      {
        title: "Busan: Gamcheon",
        places: ["gamcheon"],
        text: "A short train to Busan. Explore Gamcheon Culture Village and Jagalchi fish market.",
        stay: "Hotel in Busan",
      },
      {
        title: "Busan: Haeundae",
        places: ["haeundae"],
        text: "Beach day, the Sky Capsule and a seafood dinner.",
        stay: "Hotel in Busan",
      },
      {
        title: "KTX back to Seoul",
        places: ["gyeongbokgung"],
        text: "About 2.5 hours back to the capital.",
        stay: "—",
      },
    ],
    included: ["All 7 days planned stop by stop", "Train and bus connections", "Where to stay in each city", "Food to try in each region"],
    notIncluded: ["Flights to Korea", "Visa or K-ETA", "Travel insurance"],
    goodToKnow: [
      "Book KTX seats on the Korail website or app.",
      "Most hotels let you send luggage ahead or keep it for the day.",
      "Spring (April–May) and autumn (October) have the best weather.",
    ],
    extras: { amount: 150000, label: "Trains and buses between cities" },
  },
];

export function findTrip(id) {
  return TRIPS.find((trip) => trip.id === id);
}

export function tripsWithPlace(placeId) {
  return TRIPS.filter((trip) => trip.plan.some((day) => (day.places || []).includes(placeId)));
}

/** Estimated cost per person in local currency: backpacker to comfortable, plus the trip's extras. */
export function estimateTrip(trip) {
  const extra = trip.extras.amount;
  return {
    currency: trip.country === "korea" ? "KRW" : "MNT",
    low: dailyTotal(trip.country, "budget") * trip.days + extra,
    high: dailyTotal(trip.country, "comfort") * trip.days + extra,
  };
}
