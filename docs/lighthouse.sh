#!/usr/bin/env bash
# Run Lighthouse on every page of grigolin.org, mobile and desktop, and print a summary.
#
#   docs/lighthouse.sh                      # live site
#   docs/lighthouse.sh http://localhost:8000 # local copy (python3 -m http.server 8000)
#
# Needs Node 18+ and a Chrome/Chromium. Set CHROME_PATH if Chrome isn't found automatically.
# Full JSON reports are written to ./lighthouse-reports/ (git-ignored by convention; don't commit them).
# Note: a local python server doesn't gzip, so local performance runs a few points lower than the live site.
set -euo pipefail

BASE="${1:-https://grigolin.org}"
LH="lighthouse@12.6.1"   # pin the version so runs stay comparable with docs/performance.md
OUT="lighthouse-reports"
mkdir -p "$OUT"

for page in "" terminal/ desktop/ garden/; do
  name="${page%/}"; name="${name:-desk}"
  for preset in mobile desktop; do
    flag=""; [ "$preset" = desktop ] && flag="--preset=desktop"
    npx -y "$LH" "$BASE/$page" $flag --quiet --output=json --output-path="$OUT/$name-$preset.json" \
      --chrome-flags="--headless=new --no-sandbox" >/dev/null 2>&1 || { echo "$name $preset: run failed"; continue; }
    node -e '
      const r = require(process.argv[1]), a = r.audits, c = r.categories;
      const s = (k) => Math.round((c[k].score || 0) * 100);
      const m = (k) => a[k].displayValue;
      console.log(`${process.argv[2].padEnd(16)} perf ${s("performance")}  a11y ${s("accessibility")}  bp ${s("best-practices")}  seo ${s("seo")}` +
        `   FCP ${m("first-contentful-paint")}  LCP ${m("largest-contentful-paint")}  TBT ${m("total-blocking-time")}  CLS ${m("cumulative-layout-shift")}  SI ${m("speed-index")}`);
      for (const [k, v] of Object.entries(a))
        if (v.score !== null && v.score < 0.9 && ["binary", "numeric", "metricSavings"].includes(v.scoreDisplayMode))
          console.log(`                   - ${v.title}${v.displayValue ? " (" + v.displayValue + ")" : ""}`);
    ' "$PWD/$OUT/$name-$preset.json" "$name $preset"
  done
done
