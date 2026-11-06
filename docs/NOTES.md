# Notes for later

What was built in the Nov 2026 redesign, why it is the way it is, and the gotchas worth knowing before changing it.

## Hosting & deploy

- GitHub Pages serves the `main` branch to **grigolin.org** (see `CNAME`). Deploying means merging a pull request into `main`; the live site updates in about a minute. There's no build step.
- Pages serves everything gzipped with `Cache-Control: max-age=600`, which can't be changed (see `docs/TODO.md` for the Cloudflare option).
- Branches:
  - `archive/index-swiss-and-explorations`: the first design rounds, kept for reference. It has the Index (Swiss) finalist, Atlas, Ruler, Sheet and Ledger, the round-1 snapshots and a gallery at `/v/`.
  - `claude/festive-newton-gab7gu`: the working branch for this redesign.

## SEO / AEO

- **Crawlers don't run JS.** The Desk's Experience and Websites tiles are pre-rendered (English) into `#xp` and `#sites`; the script re-renders them on load. **When you change `EXP` or `SITES`, update that static markup too** (render the page and copy each list's `innerHTML`), and keep `llms.txt` in step.
- `index.html` carries JSON-LD (`ProfilePage` + `WebSite` + `Person`). `sameAs` lists the profiles that represent you; add new ones there.
- `robots.txt` allows everyone, AI crawlers included. `sitemap.xml` lists `/`, `/terminal/`, `/desktop/` and the résumé; add `/garden/` once it has content.
- `llms.txt` is a plain-Markdown summary for AI assistants.
- `images/og.png` is the 1200×630 social card, used by every page.
- `images/guilherme-grigolin.jpg` (512 px) is the canonical photo: JSON-LD `image`, and linked from the side sites' author pages. `images/avatar.jpg` (112 px) is the Desk avatar. Re-crop both from the same source if the photo changes.
- **Search engines.** grigolin.org is a verified **Domain** property in Google Search Console (account guigrigolin@gmail.com), verified by a TXT record at Porkbun (`google-site-verification=…`). **Don't delete that record.** The sitemap is submitted and indexing was requested on 6 Nov 2026. The same account has surebet, bitcoinhub and sniperdeals. All four sites are also in Bing Webmaster Tools (imported from Search Console); Bing feeds ChatGPT search and Copilot.
- **One person, one id.** The `Person` here has `@id` `https://grigolin.org/#person`. The author pages on surebet.com.br, bitcoinhub.com.br and sniperdeals.com.br (`/sobre`) point at that same `@id` and `url` and link here, so search engines merge them into one entity. If the bio, job or profiles change, update them here and in those three repos.
- **Positioning.** The same first phrase is used everywhere: "AI Engineer @ Concurrences · LLM agents, RAG and evals for legal research" (LinkedIn headline, GitHub bio, the profile README in `grigolin/grigolin`). Keep them in step; matching wording is what lets answer engines connect the profiles. No "Full-stack", no "Senior".
- **Surebet** stays on the Desk and in `llms.txt`, reframed as odds math plus a licensing tracker and listed last (a recruiter, brand and SEO review agreed hiding it gains nothing, since surebet's own page already names you).
- **Checking the pre-rendered lists:** render the page headless and compare `#xp`/`#sites` `innerHTML` with the static markup (ignore the `.m` metric chips, which load from `data/sites.json`).

## Structure

- **Three views of the same content.** Desk `/` is the default. Terminal `/terminal/` and Desktop `/desktop/` are alternates. The Garden `/garden/` is a fourth page.
- **Switching views:**
  - **Desk:** the footer switcher, the avatar menu, the `` ` `` key, or typing `startx`.
  - **Terminal:** the top bar, `exit`, or `startx`.
  - **Desktop:** the menu bar switcher, the logo menu, ⌘K, or `desk`/`tty` in its Terminal app.
  - **Desktop on phones:** a switcher under the clock.
- Views never load with each other. Speculation Rules (plus a small fallback) prefetch a view when a visitor hovers over or touches a link to it. Cross-document View Transitions crossfade between them.
- **Desk tiles:** `DEFAULT_WIDGETS` sets the order and what's on by default. Visitors' Customize choices are stored in `localStorage` under `desk.widgets.v2`. The default set fills the grid with no holes at 4 and 2 columns. If you add a tile, keep the cell count even.
- **On-demand code (`js/`).** Everything first paint needs stays inline in `index.html` (CSS, `I18N`, `EXP`, `SITES`, tile code), so there's no extra request on the critical path. Code that isn't needed until later lives in `js/`: `panels.js` (the Side projects, Stack and GitHub panels) loads when the browser is idle after `load`, or at once on hover, focus or touch of a panel tile; `extras.js` (arbitrage calculator, Termo) loads only when one of those tiles is visible. They are classic scripts on purpose, so they can use the page's top-level consts (`$`, `t`, `translate`, `editing`, `GH`…) directly; `panels.js` exposes `window.openPanel`. A failed load is retried on the next click. References carry `?v=<content hash>` because Pages caches for 10 min: after editing a file in `js/`, run `node scripts/check-assets.mjs --fix`. Pages ignores the query string, so for 10 minutes after a deploy an old cached `index.html` can still load the new `js/` file: keep `js/` changes compatible with the previous page (don't depend on a global the old page lacks), or ship such a change in two steps.
- **Tile order (Nov 2026):** profile, Résumé, GitHub, LinkedIn, clock, then the GitHub chart, Experience and Studying, then Websites, Side projects and Stack, then weather and BTC, then Valley, Garden and Writing. Résumé comes first because it's the most-clicked link on phones. Experience and Websites sit on opposite sides so the two text-heavy tiles never form a wall. Chosen after recruiter, designer and mobile-UX reviews; one order serves both layouts.

## Theme

- The site follows the device by default. A manual choice is stored in `localStorage` as `theme` (`light` or `dark`; no value means follow the device). It's shared by all views, and each page applies it with an inline `<head>` script before first paint.
- **Toggle behaviour (Desk, Garden, Terminal):** a click flips light and dark. If the result equals the device's own setting, the key is cleared, so the site goes back to following the device. Desk and Garden show a small blue dot while following the device. Desktop has explicit options (Match Device / Light / Dark) in its View menu and ⌘K.
- **CSS pattern:** every dark style exists twice, once as `@media (prefers-color-scheme:dark){:root:not([data-theme=light]) X{…}}` and once as `:root[data-theme=dark] X{…}`. Forgetting one copy breaks one of the two modes. To verify, pixel-compare forced Dark on a light device against native dark mode, and the reverse.
- In Chrome the switch is a circle growing from the button (a View Transition, with the `theming` class on `<html>`).

## Language

- EN/PT on the Desk and Garden. The choice is stored in `localStorage` under `lang`, as a JSON string (`"pt"`). English is the default.
- The Desk keeps every string in `I18N`. Elements are labelled `data-i` (text), `data-i-html` or `data-i-aria`. Anything rendered by script registers a re-render in `onLang`; each handler runs isolated, so one error can't stop the others.
- BTC is shown in USD in English and BRL in Portuguese.
- **The profile tile never changes height when switching language.** A hidden copy of the other language's bio (`#bioAlt`: `visibility:hidden`, `aria-hidden`, `data-nosnippet`) shares the bio's grid cell, so the tile always reserves the taller text. `setLang` refreshes it. If you edit `me.bio`, edit the PT copy in the HTML too (script overwrites it, but it's what shows before JS runs). A third language would need one hidden copy per language.

## Live data (Desk)

- **Weather:** labelled "Currently in Fernandópolis" (the profile and clock say São Paulo). open-meteo for Fernandópolis (lat −20.2839, lon −50.2464). No key. Cached in `sessionStorage` for 10 min.
- **BTC:** Coinbase `v2/prices/BTC-{USD|BRL}/historic?period=day` for the 24-hour line, falling back to `/spot`. CoinGecko was dropped because its free-tier 429s get logged as console errors, which fails Lighthouse Best Practices.
- **GitHub activity:** `api.github.com/users/grigolin/events/public`. Only loaded when the GitHub panel opens. The unauthenticated limit is 60 requests an hour per visitor IP.
- **Other GitHub numbers:** the commit heatmap, the totals and the language counts are a hard-coded snapshot from 4 Nov 2026 (`HEAT`, `LANGS`, `47`). The commits come from GitHub search (`author:grigolin`) with an authenticated token, so they include private repos (counts only, no names). Automating this is in `docs/TODO.md`.
- **Websites metrics:** Google Search clicks and impressions (30 days) in `data/sites.json`, rewritten every Monday by `.github/workflows/site-metrics.yml` via the Search Console API. Auth: service account `site-metrics@grigolin-site-metrics.iam.gserviceaccount.com` (Google Cloud project `grigolin-site-metrics`), a Restricted user on the three `sc-domain:` properties; its JSON key is the `GSC_SERVICE_ACCOUNT_JSON` secret. Cloudflare Web Analytics was rejected: sampled at this traffic, and surebet measures only with consent.
- The claude.ai Artifact preview blocks all outside requests, so those tiles show their fallbacks there. That's expected.

## Why the panel animations are built this way

- **Open:** the panel grows with a `clip-path` from the tile's rect, clamped inside the panel so the start shape is never empty. A clip also cuts off the element's own `box-shadow`. So while the panel grows, a separate `.halo` element tracks the clip's rect exactly (same start, timing and easing) and fades the panel shadow in, then the panel's real shadow takes over.
- **Close:** a clip can't reach outside the element's own box, and the GitHub tile sits partly outside the panel. So the content fades out, then a plain `.ghost` surface moves and resizes from the panel's rect to the tile's exact rect, and the tile crossfades in underneath. A swipe-down close starts from wherever the finger released the sheet.
- `open()` is ignored while a close is still running.

## Performance lessons (each one cost points once)

- Entrance animations must not start at `opacity:0`, because that delays LCP and Speed Index (mobile went 95 → 100 when this was fixed).
- No `filter` animations. A motion blur on the BTC odometer quadrupled rendering cost.
- Don't read layout (`offsetWidth`) right after writing the DOM. The language knob is now CSS-only for this reason.
- Self-host fonts. Google Fonts was render-blocking for an estimated 1.7 s on the Terminal.
- Any console error costs Best Practices points, including rate-limit errors from APIs.
- The baseline, budgets and checklist are in `docs/performance.md`. Re-run them with `docs/lighthouse.sh`.

## Accessibility lessons

- A link's or button's accessible name must contain its visible text. Don't override it with an unrelated `aria-label`.
- Use real `<button>`s. ARIA roles need the right children: for example, a `tablist` may only hold `tab`s.
- The secondary grey is `#686864` on light backgrounds, which passes AA on both tiles and wells. Text-safe green and red are `--up` and `--down`.
- Tap targets are at least 24 px, or spaced 24 px apart; the Desktop window dots have 24 px hit areas.

## Privacy

- **Public repos linked:** PolymarketOddsConverter, JusBrasil-Scraper, ai-sql-agent, ifsp-resources, neetcode-submissions and ClojureURLShortener.
- **Private repos, never named or linked:** surebet, bitcoinhub, termoinfinito, flappybird-cv, sniperdeals-landing, pinnacle-poly-bot, CSSDealsMonitor, cadeia-secreta and memoryvive.
- **Public websites linked on purpose:** surebet.com.br, bitcoinhub.com.br and sniperdeals.com.br.
- The email guigrigolin@gmail.com is published on purpose (profile tile, copy button).

## Content facts used on the site

These come from the résumé (`resources/resume.pdf`):

- **Concurrences:** AI Engineer, from Apr 2026.
- **Triad Markets:** Software Engineer, Jan to Apr 2026.
- **LISS Legal Intelligence:** Software Engineer, Aug 2023 to Jan 2026.
- **Datanis:** Software Engineering Intern, Apr to Aug 2023 (a small software house in Fernandópolis).
- **Education:** IFSP, B.S. Information Systems, graduating Dec 2026.

Logos are in `images/logos/`:

- **Concurrences and Triad:** taken from their sites. Triad's comes from triadmarkets.app.
- **LISS:** cropped from an image you supplied.
- **Datanis:** a monogram.
- **The three websites:** their own favicons.

## How changes were reviewed

- Big changes went through rounds of independent Sonnet reviewers, each with a different focus: the Desk; Terminal, Desktop and Garden; and code, docs and deploy. Fixes were re-verified with Playwright (screenshots, frame-by-frame recordings, pixel diffs between themes) and Lighthouse before merging.
- A useful trick for animation bugs: record with Playwright's `recordVideo`, extract frames with `ffmpeg -vf fps=25`, then measure element rects per frame.
