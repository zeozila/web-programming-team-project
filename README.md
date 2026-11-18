# SeoulBaatar — Korea ⇄ Mongolia travel guide

**Team 6 · Web Programming final project**

SeoulBaatar is a two-way travel guide for people going between Korea and Mongolia.
Choose **Korea** or **Mongolia** at the top of any page and the whole site switches:
places, map, phrasebook, currency, weather, packing list and quiz.

The name mixes *Seoul* and *Ulaanbaatar* ("baatar" means hero in Mongolian).

- **Live website:** https://zeozila.github.io/web-programming-team-project/
- **Project proposal:** [docs/proposal.pdf](docs/proposal.pdf)

## Team

| Name | Student ID | Role |
| --- | --- | --- |
| Munkhbold Bilguun (leader) | 202537630 | Frontend, page layout, GitHub & deployment |
| Mashbat Temuulen | 202537735 | JavaScript features, map, weather & currency APIs |
| Gantulga Bolortsetseg | 202637491 | UI/UX design, colours, mobile layout, dark mode |
| Khali Nurjanat | 202537452 | Content (places, phrases, quiz), testing, presentation |

## Features

- **Home** – photo slideshow, live Seoul / Ulaanbaatar clocks, live exchange rate, top picks, food, a Korea vs Mongolia comparison and tips from our team
- **Explore** – 26 places with a Leaflet map. Filter by country, category, best month or saved places, search (also works without special letters, e.g. "sukhbaatar"), and open a detail window with photos, a local tip and the best months to visit. Every place has its own link, e.g. `explore.html#place=khongor`
- **Phrasebook** – 41 phrases in Korean and Mongolian with romanization, audio (Web Speech API), copy button and flashcards that remember what you've learned
- **Planner** – KRW / MNT / USD converter with live rates, 5-day weather for 7 cities, budget calculator, packing checklist and "My trip" (saved places, printable)
- **Quiz** – 18 culture questions, 10 per round, shuffled answers, explanations and best score
- **About** – team, tech stack and photo credits
- Light / dark mode, works on phones, keyboard friendly

## Built with

- HTML5, CSS3 (Grid, Flexbox, custom properties, `<dialog>`)
- Vanilla JavaScript (ES modules, `fetch`, `localStorage`)
- [Leaflet](https://leafletjs.com/) with OpenStreetMap / CARTO map tiles
- [Open-Meteo](https://open-meteo.com/) weather API and [ExchangeRate-API](https://www.exchangerate-api.com/) open endpoint (no API keys needed)
- Hosted on GitHub Pages

No frameworks and no build step.

## Folder structure

```
├── index.html          Home
├── explore.html        Places + map
├── phrasebook.html     Phrases + flashcards
├── planner.html        Converter, weather, budget, packing, my trip
├── quiz.html           Culture quiz
├── about.html          Team, tech and credits
├── css/
│   ├── fonts.css       Self-hosted fonts
│   └── main.css        All styles (variables, components, pages, responsive)
├── js/
│   ├── theme-init.js   Sets dark mode / destination before the page draws
│   ├── data/           Places, phrases, quiz questions, photo list
│   ├── lib/            Shared code: header/footer, storage, APIs, icons, cards
│   └── pages/          One script per page
├── assets/             Fonts and favicon
├── vendor/leaflet/     Leaflet map library
└── docs/proposal.pdf   Our project proposal
```

## Running it locally

The scripts are ES modules, so the pages must be opened through a web server (not by double-clicking the file):

```bash
# any of these works
python -m http.server 8000
npx serve .
```

Then open http://localhost:8000. In VS Code the *Live Server* extension also works.

## Credits

- Photos: Wikimedia Commons contributors — every photo, author and licence is listed on the [About page](about.html#credits)
- Map data © OpenStreetMap contributors, tiles by CARTO
- Weather: Open-Meteo.com (CC BY 4.0) · Exchange rates: ExchangeRate-API
- Icons: [Lucide](https://lucide.dev) (ISC) · Fonts: Onest, Archivo, Caveat (SIL OFL)
