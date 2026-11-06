#!/usr/bin/env node
/* Rewrites data/sites.json with 30-day traffic for the Websites tile.
   - visits_30d, pageviews_30d: Cloudflare Web Analytics (all three sites sit behind Cloudflare).
   - clicks_30d, impressions_30d: Google Search Console (domain properties, sc-domain:<host>).
   One window for both: the 30 days ending 3 days ago (Search Console lags ~2–3 days); asOf = its last day.
   Each source is optional and independent: missing credentials skip it, a failure keeps the previous numbers.
   Env: CF_API_TOKEN (Account Analytics: Read), CF_ACCOUNT_ID, GSC_SERVICE_ACCOUNT_JSON (service-account key JSON).
   No dependencies; Node 20+. Usage: node scripts/site-metrics.mjs [--dry-run] */
import { readFile, writeFile } from 'node:fs/promises';
import { createSign } from 'node:crypto';

const FILE = new URL('../data/sites.json', import.meta.url);
const day = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 864e5);

export function window30(now = new Date()) {
  const end = addDays(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())), -3);
  return { start: day(addDays(end, -29)), end: day(end) };
}

async function json(fetch, url, init) {
  const r = await fetch(url, init);
  const body = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${url}: ${body.slice(0, 300)}`);
  return JSON.parse(body);
}

/* Cloudflare RUM, grouped by host. Returns { host: { visits_30d, pageviews_30d } }. */
export async function cloudflare({ fetch, token, account, start, end }) {
  const query = `query($a:String!,$s:Date!,$e:Date!){viewer{accounts(filter:{accountTag:$a}){
    rumPageloadEventsAdaptiveGroups(limit:1000,filter:{date_geq:$s,date_leq:$e}){count sum{visits} dimensions{requestHost}}}}}`;
  const d = await json(fetch, 'https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables: { a: account, s: start, e: end } }),
  });
  if (d.errors?.length) throw new Error('Cloudflare: ' + d.errors.map((e) => e.message).join('; '));
  const out = {};
  for (const g of d.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || []) {
    const host = g.dimensions.requestHost.replace(/^www\./, '');
    const o = (out[host] ||= { visits_30d: 0, pageviews_30d: 0 });
    o.visits_30d += g.sum.visits; o.pageviews_30d += g.count;
  }
  return out;
}

async function googleToken(fetch, sa) {
  const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
  const d = await json(fetch, 'https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  return d.access_token;
}

/* Search Console totals for one domain property. Returns { clicks_30d, impressions_30d }. */
export async function searchConsole({ fetch, token, host, start, end }) {
  const site = encodeURIComponent(`sc-domain:${host}`);
  const d = await json(fetch, `https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ startDate: start, endDate: end, dataState: 'final' }),
  });
  const row = d.rows?.[0] || { clicks: 0, impressions: 0 };
  return { clicks_30d: row.clicks, impressions_30d: row.impressions };
}

export async function update({ fetch = globalThis.fetch, env = process.env, now = new Date(), data }) {
  const { start, end } = window30(now);
  const hosts = Object.keys(data.sites);
  const set = (host, vals) => Object.assign(data.sites[host].stats, vals);
  const errors = []; let fresh = 0;

  if (env.CF_API_TOKEN && env.CF_ACCOUNT_ID) {
    try {
      const cf = await cloudflare({ fetch, token: env.CF_API_TOKEN, account: env.CF_ACCOUNT_ID, start, end });
      for (const h of hosts) { set(h, cf[h] || { visits_30d: 0, pageviews_30d: 0 }); if (!cf[h]) console.warn(`Cloudflare: no data for ${h}`); }
      fresh++;
    } catch (e) { errors.push(e.message); }
  } else console.warn('Cloudflare: CF_API_TOKEN / CF_ACCOUNT_ID not set, skipped');

  if (env.GSC_SERVICE_ACCOUNT_JSON) {
    try {
      const token = await googleToken(fetch, JSON.parse(env.GSC_SERVICE_ACCOUNT_JSON));
      for (const h of hosts) {
        try { set(h, await searchConsole({ fetch, token, host: h, start, end })); fresh++; } catch (e) { errors.push(`${h}: ${e.message}`); }
      }
    } catch (e) { errors.push(e.message); }
  } else console.warn('Search Console: GSC_SERVICE_ACCOUNT_JSON not set, skipped');

  if (fresh) data.asOf = end;
  return { data, errors, fresh };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const before = await readFile(FILE, 'utf8');
  const { data, errors, fresh } = await update({ data: JSON.parse(before) });
  for (const e of errors) console.log(`::warning::${e.replace(/\n/g, ' ')}`);
  const after = JSON.stringify(data, null, 2) + '\n';
  if (process.argv.includes('--dry-run')) console.log(after);
  else if (after !== before) await writeFile(FILE, after);
  console.log(`${fresh ? 'updated' : 'nothing fetched'}; ${errors.length} error(s)`);
  if (errors.length && !fresh) process.exit(1); // every configured source failed: fail loudly
}
