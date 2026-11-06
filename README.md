# grigolin.org

Personal site of Guilherme Grigolin. Plain HTML, CSS and JavaScript, served by GitHub Pages.

The same content in three views:

| Path | View | How to get there |
|---|---|---|
| `/` | **Desk** (default): tiles with live widgets | — |
| `/terminal/` | **Terminal**: keyboard-first, with a working shell | Desk footer, the avatar menu, or press `` ` `` on the Desk |
| `/desktop/` | **Desktop**: windows, dock and ⌘K | Desk footer, the avatar menu, type `startx` on the Desk or in the terminal |

From the terminal, `exit` goes back to the Desk. From the desktop, use the logo menu, ⌘K, or `desk` in its Terminal app.

The Garden at `/garden/` (linked from the Desk) is a list of links and reading; add entries to `GARDEN` at the top of `garden/index.html`.

Desk widgets are configured by `DEFAULT_WIDGETS` near the top of the script in `index.html`; visitors can also toggle them with **Customize** in the footer.

Earlier design explorations (Index, Atlas, Ruler, Sheet, Ledger and the round-1 snapshots) are kept on the `archive/index-swiss-and-explorations` branch.

Performance and accessibility baseline, budgets and a re-check checklist are in `docs/performance.md`; run `docs/lighthouse.sh` after big changes.

## Where things live

- `index.html`: the Desk. All its CSS, JS and EN/PT strings are inline. Tiles are configured in `DEFAULT_WIDGETS`; experience in `EXP`; websites in `SITES`; the GitHub snapshot in `HEAT`.
- `data/sites.json`: Google Search clicks and impressions for the Websites tile, rewritten every Monday by `.github/workflows/site-metrics.yml` (`scripts/site-metrics.mjs`, Search Console API). `null` or `0` hides a value. Setup is in `docs/NOTES.md`.
- `garden/index.html`: add links and reading to `GARDEN` at the top.
- **Theme:** the site follows the device by default. Desk and Garden have a sun/moon button, the Terminal has `[light]/[dark]`, and the Desktop has its View menu or ⌘K. The choice is stored in `localStorage` as `theme` and shared by every view.
- **Language:** EN/PT on the Desk and Garden, stored as `lang`.
- `about.html`, `projects.html`, `writings.html`: redirects to `/` for old links.
- `404.html`: served by GitHub Pages for any missing path. It reuses the Valley engravings; every URL in it must be absolute (`/fonts/…`, `/images/…`) because it can be served at any depth. `noindex`.
- `fonts/`: self-hosted Geist and JetBrains Mono. Licences are in `fonts/README.md`.
- `docs/`: `performance.md` (Lighthouse baseline, budgets, checklist), `lighthouse.sh`, `TODO.md`, and `NOTES.md` (decisions and gotchas).
- `CNAME`: the custom domain, grigolin.org.
- `robots.txt`, `sitemap.xml`, `llms.txt`, `images/og.png`: search, AI and social metadata (see `docs/NOTES.md`).

