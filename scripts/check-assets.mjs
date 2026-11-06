#!/usr/bin/env node
/* Checks that every on-demand script index.html references as `js/<file>.js?v=<hash>` carries the file's current
   content hash (first 8 hex chars of SHA-1). GitHub Pages caches for 10 min, so a stale ?v= could pair new HTML
   with an old script. Usage: node scripts/check-assets.mjs [--fix]   (exit 1 when out of date and not fixed) */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url);
const page = new URL('index.html', root);
let html = readFileSync(page, 'utf8');
const fix = process.argv.includes('--fix');
let stale = 0;

html = html.replace(/(js\/[\w-]+\.js)\?v=([0-9a-f]+)/g, (all, file, v) => {
  const want = createHash('sha1').update(readFileSync(new URL(file, root))).digest('hex').slice(0, 8);
  if (v === want) return all;
  stale++;
  console.log(`${file}: ?v=${v} should be ${want}`);
  return `${file}?v=${want}`;
});

if (stale && fix) { writeFileSync(page, html); console.log(`updated ${stale} reference(s)`); }
else if (stale) { console.log('run: node scripts/check-assets.mjs --fix'); process.exit(1); }
else console.log('asset versions OK');
