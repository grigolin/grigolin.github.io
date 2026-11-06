# TODO

Open items after the Nov 2026 redesign. They're grouped by who has to act and roughly ordered by value. Tick them off or delete them as they're done.

## Content (needs you)

- [ ] **Garden.** Add your first links and reading to `GARDEN` at the top of `garden/index.html`; every section currently shows "Nothing planted here yet".
- [ ] **Writing tile.** Publish a first note, then replace the "Nothing published yet" placeholder and decide where posts live (for example `/writing/`).
- [ ] **Website metrics.** Fill `data/sites.json` with visitors, views, clicks or impressions for surebet.com.br, bitcoinhub.com.br and sniperdeals.com.br. The tile shows only the numbers that are set. Tell me which analytics each site uses (Search Console, Vercel, Plausible, Umami…) so it can be automated, see below.
- [ ] **Experience label.** It shows "3+ years", computed from `CAREER_START = '2023-04'` (Datanis). You had asked for "4+"; change `CAREER_START`, or hard-code the label, if you count earlier work.
- [ ] **Copy check.**
  - Review the wording I wrote for the JusBrasil-Scraper and ifsp-resources descriptions, the Experience blurbs, and the Side projects texts.
  - The profile says "São Paulo, Brazil" while the weather is for Fernandópolis. Make sure that's how you want it.
- [ ] **Off-by-default tiles.** The arbitrage calculator and the Termo game sit in Customize. Keep them or delete them.

## Automation (recommended)

- [ ] **GitHub snapshot refresh.** A scheduled GitHub Action (weekly) should write `data/github.json` with the weekly commit counts, the total, the repo count and the language counts. Today these are hard-coded: `HEAT` in `index.html`, `47` in about 5 places, and `LANGS`. The commit counts include private repos, so the Action needs a token with read access to them, stored as a repo secret. Then make the Desk read the JSON.
- [ ] **Site metrics refresh.** The same kind of Action should rewrite `data/sites.json` (and its `asOf`) from your analytics APIs.
- [ ] **Quality checks on each pull request.** A GitHub Action that runs:
  - `docs/lighthouse.sh` on the pull request's preview (or after deploy);
  - a link and 404 check of all pages;
  - a console-error check;
  - the HTML budget from `docs/performance.md`.

## Maintainability

- [ ] **Shared theme code.**
  - The theme toggle is implemented four times: two near-identical copies on the Desk and Garden, plus variants on the Desktop and Terminal. Extract the shared logic and the small helpers (`store`, `esc`, `t`) into one deferred `js/site.js`. Keep the tiny inline `<head>` snippet so there's no flash.
  - The dark-rule pattern (each dark style written twice) is easy to forget. A small build-free lint script could check that every `prefers-color-scheme:dark` rule has a matching `[data-theme=dark]` copy.
- [ ] **Desk HTML size.** It's at about 130 KB raw against a 140 KB budget. If it grows, move the `I18N` table and the `EXP`/`SITES` data to a deferred file.
- [ ] **Unused CSS.** Run a pass after any tile is removed. A leftover from the removed Stats tile slipped through once.

## UX polish (small)

- [ ] **Review the order of the Desk tiles.**
  - **Questions:** what a visitor sees first, and what order tells the story best: who you are, then what you do now, then proof (experience, websites, projects), then the extras (weather, BTC, Valley, Garden).
  - **Check both layouts:** desktop (4 columns, the first screen is roughly the first two rows) and phone (2 columns, where only the profile, clock and links fit on the first screen).
  - **Today's order:** profile, clock, GitHub link, LinkedIn, Résumé, Experience, GitHub stats, weather, BTC, Websites, Side projects, Stack, Studying, Valley, Garden, Writing.
  - **Possible changes:**
    - Move Experience and Websites above the live widgets.
    - Give phones their own order, for example with CSS `order`.
  - **Where to change it:** `DEFAULT_WIDGETS` sets the order. The grid packs densely, so check for holes at 4 and 2 columns after any reordering.

- [ ] **The language switch jumps when you change language.**
  - **What happens:** the Portuguese bio is longer, so on narrow screens it wraps to one more line. The profile tile grows and the EN/PT switch (and the theme button next to it) moves down, then back up when you switch back.
  - **Measured at 390 px:** the tile goes from 312 → 335 px and the switch moves 23 px. At 1280 px nothing moves, because there the tile's height comes from its grid row.
  - **Fix idea:** reserve the bio's height for whichever language is taller. Either measure both strings once and set `min-height` on the bio, or set `min-height` to a line count per breakpoint. Alternatively, anchor the switch row to the tile's bottom so the extra line grows into empty space instead of pushing the switch.

- [ ] **Desktop view on phones.** The home screen has no appearance (theme) control; you can only change it from another view. Add one.
- [ ] **Terminal and Desktop in Portuguese.** They're English-only; the Desk and Garden switch EN/PT.
- [ ] **Garden.** It has only a "← grigolin.org" link; consider the Desk / Terminal / Desktop switcher.
- [ ] **Valley tile.** It works from the keyboard (Enter or Space) but has no role. `role="button"` isn't allowed on its `<section>` and fails Lighthouse; the proper fix is a real `<button>` inside the tile.
- [ ] **Copy button.** If both clipboard methods fail, there's no message (the address is left selected so it can be copied by hand). Show a short "Press Ctrl+C" hint.
- [ ] **Portuguese GitHub activity.** The activity text embeds GitHub's English ref type ("Criou branch em…").
- [ ] **Desktop phone home-screen switcher.** The buttons are 28 px tall. That passes the 24 px minimum, but 44 px is nicer for thumbs.

## Infrastructure / SEO (optional)

- [ ] **Cache lifetimes.** GitHub Pages sends `max-age=600` on everything. Putting Cloudflare (free) in front of the domain, with long cache rules for `/fonts/*` and `/images/*`, would clear Lighthouse's only remaining warning and speed up repeat visits.
- [ ] **Real-user data.** In a few weeks, check https://pagespeed.web.dev for real-user Core Web Vitals, once there's enough traffic.
- [ ] **Real devices.** Test on Safari/iOS and Firefox: the motion feel, the fallbacks when View Transitions aren't supported, swipe-to-close on the panel sheet, and the Desktop view's dock.

## Housekeeping (your call)

- [ ] **Private repo name in git history.** "termoinfinito" appears in three old commits (cccb30e, 03ac181, 04c6997) as the text "Private repo · termoinfinito", with no link. It's not in the current site. Removing it would need a history rewrite and a force-push to `main`. Only do that if it matters to you.
- [ ] **Old branches.**
  - Delete `archive/index-swiss-and-explorations` once you're sure you won't revisit the Index or other explorations.
  - Delete `claude/festive-newton-gab7gu` once its work has been merged and you no longer need it.
