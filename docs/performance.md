# Performance & quality baseline

This is the reference to compare against after any big change: a redesign, new tiles, new fonts or images, new third-party calls, or a new page. Re-run everything below and compare it with the baseline. If a number gets worse, either fix it or record here why it's acceptable.

## Baseline: 5 Nov 2026

Measured on the live site (https://grigolin.org) with Lighthouse 12.6.1, using its default simulated throttling (mobile is a mid-range phone on slow 4G). The scores are Performance / Accessibility / Best practices / SEO.

| Page | Mobile | Desktop | Mobile FCP | Mobile LCP | TBT | CLS | Mobile Speed Index |
|---|---|---|---|---|---|---|---|
| Desk `/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.2 s | 1.5 s | 20 ms | 0 | 1.3 s |
| Terminal `/terminal/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0.9 s | 1.1 s | 0 ms | 0 | 1.2 s |
| Desktop `/desktop/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.0 s | 1.0 s | 0 ms | 0 | 1.3 s |
| Garden `/garden/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 0.8 s | 1.2 s | 0 ms | 0 | 0.9 s |

**Re-check, 6 Nov 2026** (after the SEO pass: pre-rendered tiles, JSON-LD, photo avatar): every page still 100 / 100 / 100 / 100 on mobile and desktop. Desk mobile FCP 1.1 s, LCP 1.1 s, TBT 10 ms, CLS 0, Speed Index 1.1 s.

The scores before this baseline were Desk mobile 95 / 92 / 100 / 100 (LCP 2.4 s, Speed Index 4.5 s), Terminal mobile 91 (with Google Fonts blocking rendering for an estimated 1.7 s), Garden accessibility 96, and Desktop accessibility 88 at desktop size.

**Known, accepted findings**
- **"Use efficient cache lifetimes."** GitHub Pages serves every file with `Cache-Control: max-age=600`, and the site can't change that. It doesn't count towards the score and only affects repeat visits. The fix would be a CDN in front of the domain, such as Cloudflare with a cache rule for `/fonts/*` and `/images/*`.
- **"Minify JavaScript/CSS" (a few KB).** The site has no build step on purpose. GitHub Pages gzips everything, so the gain is tiny.
- **Field data (CrUX).** There isn't enough traffic for Google to report real-user Core Web Vitals yet. Check https://pagespeed.web.dev/analysis?url=https://grigolin.org/ from time to time; when the "Discover what your real users are experiencing" section appears, the targets are LCP < 2.5 s, INP < 200 ms and CLS < 0.1 at the 75th percentile.

## How to re-run

```bash
docs/lighthouse.sh                         # live site, all pages, mobile + desktop
```

```bash
python3 -m http.server 8000 &              # or test a local copy before deploying
docs/lighthouse.sh http://localhost:8000
```

Or use https://pagespeed.web.dev for one page at a time. It runs the same Lighthouse engine, but results from a different machine vary by a few points; compare like with like. Run each page twice if a number looks off, because Lighthouse varies by ±2–3 points from run to run.

## Budgets for the Desk's initial load

Don't break these without a reason. "Today" was measured on 5 Nov 2026 with Playwright. Transfer counts the HTML gzipped as GitHub Pages serves it; the API responses (weather, BTC) are small and not included.

| | Budget | Today, phone (390 px) | Today, desktop (1440 px) |
|---|---|---|---|
| Requests on first load | ≤ 15 | 11 | 13 |
| Transferred bytes | ≤ 120 KB phone / ≤ 250 KB desktop | ~85 KB | ~230 KB (the Valley engraving is near the fold, so it loads) |
| HTML | ≤ 140 KB raw / ≤ 40 KB gzipped | 137.5 KB / 39 KB (6 Nov 2026) | same |
| Render-blocking resources | 0 | 0 | 0 |
| Third-party requests before first paint | 0 | 0 | 0 |
| Fonts | 1 self-hosted woff2, preloaded | `fonts/geist-latin.woff2` (29 KB) | same |

`<head>` preconnects to `api.open-meteo.com` and `api.coinbase.com`. That only warms up connections and requests nothing, so the APIs are still called after first paint. GitHub's API is only called when its panel opens.

The HTML is close to its budget because all CSS, JS and both languages' strings are inline. If it grows past it, move the I18N table and the EXP/SITES data into a separate deferred file; see `docs/TODO.md`.

## What keeps these numbers high

Keep these in mind when changing things:

1. **No render-blocking third parties.**
   - Fonts are self-hosted in `fonts/` and preloaded. Don't go back to Google Fonts `<link>`s.
   - All CSS is inline. If you add a library, load it with `defer`, or only when it's needed.
2. **Tiles must be visible in the first frame.**
   - Entrance animations may move things (`transform`) but must not start at `opacity: 0`, because that delays LCP and Speed Index.
   - Anything below the fold can lazy-load, like the Valley image and the Garden sprites.
3. **No layout shift.**
   - Images have a `width`/`height`. Live tiles (weather, BTC) reserve their space with skeletons.
   - Don't render tile content late if the tile's height depends on it.
4. **Animate only `transform` and `opacity` for anything that runs often or on many elements.** Never animate `filter` (blur), `width`, `top` and the like on things that move often. Example: a motion blur on the BTC odometer quadrupled rendering cost (225 ms → 948 ms on Lighthouse's mobile profile), so it was removed. Promote with `will-change` only while something is moving. The exceptions are one-shot animations on a single element: the panel open (`clip-path` plus the `.halo` shadow element) and close (the `.ghost` surface animating `left`/`top`/`width`/`height`). Keep those cheap and short.
5. **Main thread.**
   - Tiles that are off by default initialise in `later(...)` (idle time).
   - Avoid reading layout (`offsetWidth`, `getBoundingClientRect`) straight after writing to the DOM; measure in `requestAnimationFrame`.
6. **Images.**
   - Engravings are lossless WebP.
   - Logos are about 64 px for a 32 px display, which is right for 2× screens.
   - Prefer SVG for icons.
7. **Other views.** `/terminal/`, `/desktop/` and `/garden/` are never loaded with the Desk. They're prefetched on hover or touch, through Speculation Rules plus a fallback, so switching feels instant.
8. **Accessibility rules that Lighthouse checks and we pass today.**
   - **Contrast:** text contrast ≥ 4.5:1. The secondary grey is `#686864` on light; check new colours.
   - **Accessible names:** a link's or button's name must contain its visible text, so don't put an `aria-label` that replaces visible text.
   - **Native elements:** use real `<button>`s, not `role="button"` on `<li>`/`<div>`.
   - **Tap targets:** at least 24 × 24 px, or spaced 24 px apart.
   - **ARIA roles:** only use one if its required children follow; for example, a `tablist` contains only `tab`s.

## Checklist after a big change

Run all of this, not just Lighthouse:

- [ ] `docs/lighthouse.sh` on the live site: every page, mobile and desktop, at 100 / 100 / 100 / 100 or explained above.
- [ ] No console errors on `/`, `/terminal/`, `/desktop/` and `/garden/`. Lighthouse's Best Practices fails on any logged error, including a 429 from a rate-limited API, so prefer APIs that don't rate-limit anonymous browsers. CoinGecko was replaced by Coinbase for this reason.
- [ ] No 404s: links, images, fonts, `data/sites.json`, `resources/resume.pdf`, `favicon.svg`.
- [ ] Widths 1440, 1280, 900, 820, 600, 390 and 375 (and 320 for the BTC price), in both light and dark mode, with no sideways scroll, clipped text or overlaps.
- [ ] The Desk grid has no holes at 4 and 2 columns with the default tiles, and still works after Customize → Reset.
- [ ] EN ⇄ PT: every string, date and number switches (BTC switches between USD and BRL), and the choice is remembered on reload and shared with the Garden.
- [ ] Keyboard only: Tab through the Desk, open and close each panel (Esc returns focus), and use Customize, the Experience rows and the Valley tile.
- [ ] Reduced motion (`prefers-reduced-motion: reduce`): content appears without animation.
- [ ] Theme: forced Light on a dark device and forced Dark on a light device look identical to the native modes on every view, and there's no flash of the wrong theme on reload.
- [ ] View switching works everywhere:
  - [ ] **Desk:** footer, avatar menu, the `` ` `` key, typing `startx`.
  - [ ] **Terminal:** top bar, `exit`, `startx`.
  - [ ] **Desktop:** menu bar, logo menu, ⌘K, terminal `desk`/`tty`.
  - [ ] **Phone home screen:** its switcher.
- [ ] Privacy: no private GitHub repo names or links. Only the public websites surebet.com.br, bitcoinhub.com.br and sniperdeals.com.br are linked on purpose.
- [ ] Update the baseline table above with the new numbers and the date.

## Notes

- **Theme:**
  - **Default:** the site follows the device's setting (`prefers-color-scheme`).
  - **Manual choice:** the visitor can pick Light or Dark. The choice is saved in `localStorage` under `theme` (`light` or `dark`; no value means follow the device). It's shared by every view and applied by an inline script in `<head>` before first paint.
  - **Where to switch:**
    - **Desk and Garden:** the sun/moon button. A click flips the appearance; flipping back to what the device uses returns to Auto, shown by a small dot.
    - **Terminal:** `[light]/[dark]`.
    - **Desktop:** View menu or ⌘K.
  - **CSS pattern:** every dark rule exists twice: `@media (prefers-color-scheme:dark){:root:not([data-theme=light]) …}` and `:root[data-theme=dark] …`. A new dark style needs both.
- **GitHub numbers:** the heatmap and commit totals on the Desk are a snapshot (`HEAT` in `index.html`, as of 4 Nov 2026). Refresh them when you re-run this checklist.
