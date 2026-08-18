# Field Sales CRM

A fast, personal field-sales CRM for visiting and following up with
businesses — see `PROMPT.md` for the full original spec this was built
from.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. Works on desktop and mobile browsers (try it
on your phone over your local network, or `npm run build && npm run
preview` for a production build).

## Current phase: frontend-only, no backend

There's no server and no database yet. All data (businesses + visits) is
stored in your browser's `localStorage`, via `src/lib/storage.js`. That
means:

- **Data is per-browser.** It won't sync between your laptop and phone,
  and clearing browser data clears your CRM data. Use `exportAll()` in
  `src/lib/storage.js` (or your browser dev tools) to back it up
  manually if needed.
- **Comfortable for up to ~50 businesses** (`RECORD_SOFT_CAP` in
  `src/lib/constants.js`). You'll see a soft warning in the Businesses
  list once you're close — that's your cue to move to a real backend, not
  a hard limit.
- **No real authentication.** Whoever has the browser/device has the
  data. Fine for personal use on a device only you use; not fine for
  anything shared or public-facing.

## Moving to a backend + MySQL later

`src/lib/storage.js` is the *only* file that talks to storage — every
component just calls `getBusinesses()`, `saveBusinesses()`,
`getVisits()`, `saveVisits()`. When you're ready:

1. Stand up a small backend (Node/Express, or whatever fits your
   existing SaaS stack) with a MySQL database mirroring the Business and
   Visit shapes in `PROMPT.md`.
2. Add real authentication there (sessions or JWT), and scope all
   queries to the logged-in user.
3. Replace the bodies of the four functions in `src/lib/storage.js` with
   `fetch()` calls to your new API — a sketch of exactly this is
   commented at the bottom of that file. No other file needs to change.
4. Same pattern for `src/lib/aiSummary.js`: point `generateSummary` at a
   backend route that calls the Anthropic API server-side (keeping the
   API key off the frontend), instead of the local deterministic
   summarizer it uses today.

## Project structure

```
src/
  main.jsx              — entry point
  App.jsx                — root: navigation state, wires screens together
  lib/
    constants.js          — design tokens, sectors/statuses/enums
    helpers.js             — id/date/link utilities
    storage.js              — data persistence (localStorage today; swap point for a backend)
    aiSummary.js              — customer-summary service (local today; swap point for real AI)
  hooks/
    useCrmData.js              — all CRM state + derived data (follow-ups, stats, mutations)
  components/
    layout/Navigation.jsx        — sidebar (desktop) + bottom nav (mobile)
    Dashboard.jsx                  — today's/overdue follow-ups, stats, sector summary
    AddBusinessForm.jsx             — Screen 2
    AddVisitForm.jsx                 — Screen 3 (the most important one)
    BusinessesList.jsx                — Screen 4, with search/filters
    BusinessProfile.jsx                — Screen 5: pre-visit summary, AI summary, visit timeline, edit
    FollowUpsScreen.jsx                 — Screen 6: Today/Overdue/Upcoming/Completed tabs
    ui/Primitives.jsx                    — shared building blocks (Card, Field, ChipGroup, etc.)
```

## Not built (by design, per the spec)

Inventory management, invoicing, payroll, marketing automation, complex
analytics, and anything else outside the field-visit workflow — see the
"DO NOT BUILD" section of `PROMPT.md`.
