# TODO

Open items after the Nov 2026 redesign. They're grouped by who has to act and roughly ordered by value. Tick them off or delete them as they're done.

## Content (needs you)

- [ ] **Garden.** Add your first links and reading to `GARDEN` at the top of `garden/index.html`; every section currently shows "Nothing planted here yet".
- [ ] **Writing tile.** Publish a first note, then replace the "Nothing published yet" placeholder and decide where posts live (for example `/writing/`).
- [ ] **Experience label.** It shows "3+ years", computed from `CAREER_START = '2023-04'` (Datanis). You had asked for "4+"; change `CAREER_START`, or hard-code the label, if you count earlier work.
- [ ] **Copy check.**
  - Review the wording I wrote for the JusBrasil-Scraper and ifsp-resources descriptions, the Experience blurbs, and the Side projects texts.
- [ ] **Off-by-default tiles.** The arbitrage calculator and the Termo game sit in Customize. Keep them or delete them.

## Automation (recommended)

- [ ] **GitHub snapshot refresh.** A scheduled GitHub Action (weekly) should write `data/github.json` with the weekly commit counts, the total, the repo count and the language counts. Today these are hard-coded: `HEAT` in `index.html`, `47` in about 5 places, and `LANGS`. The commit counts include private repos, so the Action needs a token with read access to them, stored as a repo secret. Then make the Desk read the JSON.
- [ ] **Search Console key: keyless auth (optional).** The weekly metrics Action uses a long-lived JSON key (`GSC_SERVICE_ACCOUNT_JSON`) for a read-only service account. Workload Identity Federation (GitHub OIDC → Google) would remove the key. If you keep the key, rotate it yearly in the `grigolin-site-metrics` Google Cloud project.
- [ ] **Quality checks on each pull request.** A GitHub Action that runs:
  - `docs/lighthouse.sh` on the pull request's preview (or after deploy);
  - a link and 404 check of all pages;
  - a console-error check;
  - the HTML budget from `docs/performance.md`.

## Maintainability

- [ ] **Shared theme code.**
  - The theme toggle is implemented four times: two near-identical copies on the Desk and Garden, plus variants on the Desktop and Terminal. Extract the shared logic and the small helpers (`store`, `esc`, `t`) into one deferred `js/site.js`. Keep the tiny inline `<head>` snippet so there's no flash.
  - The dark-rule pattern (each dark style written twice) is easy to forget. A small build-free lint script could check that every `prefers-color-scheme:dark` rule has a matching `[data-theme=dark]` copy.
- [ ] **Desk HTML size (getting close).** 137.5 KB raw / 39 KB gzipped against a 140 / 40 KB budget (6 Nov 2026). The next sizeable change should first move the `I18N` table and the `EXP`/`SITES` data to a deferred file.
- [ ] **Unused CSS.** Run a pass after any tile is removed. A leftover from the removed Stats tile slipped through once.

## UX polish (small)

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
