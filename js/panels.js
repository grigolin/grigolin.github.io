/* Desk: panels (Side projects, Stack, GitHub). Loaded on demand by index.html, after first paint.
   A classic script on purpose: it uses the page's top-level consts ($, t, translate, editing, GH, LANGS...). */
/* ---------------- panels: Side projects, Stack ---------------- */
(() => {
  const dlg = $('#panel'), scrim = $('#scrim'), body = $('#pBody');
  const H = { projects: ['pj.title', 'pj.sub'], stack: ['st.title', 'st.sub'], github: ['g.title', 'g.sub'] };
  let from = null, current = null, stopDemos = () => {};
  const mobile = () => matchMedia('(max-width:520px)').matches;

  function place() {
    const w = dlg.offsetWidth, h = dlg.offsetHeight;
    if (mobile()) { dlg.style.left = ''; dlg.style.top = ''; return; }
    dlg.style.left = Math.round((innerWidth - w) / 2) + 'px';
    dlg.style.top = Math.round(Math.max(24, (innerHeight - h) / 2 - 12)) + 'px';
  }
  function open(kind, card) {
    if (closing || dlg.open) return;
    current = kind; from = card;
    body.innerHTML = ''; body.appendChild($('#tpl-' + kind).content.cloneNode(true));
    $('#pTitle').textContent = t(H[kind][0]); $('#pSub').textContent = t(H[kind][1]);
    translate(dlg);
    scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('on'));
    dlg.showModal(); place();
    document.documentElement.style.overflow = 'hidden';
    stopDemos = kind === 'projects' ? startDemos() : kind === 'stack' ? startStack() : startGithub();
    if (reduce) return;
    const r = card.getBoundingClientRect(), p = dlg.getBoundingClientRect();
    card.style.transition = 'opacity .2s'; card.style.opacity = '0';
    // A clip-path also clips the panel's own box-shadow, so while the panel grows its shadow is drawn by a
    // separate "halo" that tracks the clip's rect exactly (same start rect, timing and easing) and eases from
    // the tile's shadow to the panel's. When the clip is removed the panel's real shadow takes over, identical.
    const w0 = Math.min(r.width, p.width), h0 = Math.min(r.height, p.height);
    const l0 = Math.min(Math.max(r.left, p.left), p.right - w0), t0 = Math.min(Math.max(r.top, p.top), p.bottom - h0);
    const s0 = { l: l0, t: t0, r: l0 + w0, b: t0 + h0 };   // tile-sized start rect clamped into the panel, so it is never empty
    const inset0 = `inset(${s0.t - p.top}px ${p.right - s0.r}px ${p.bottom - s0.b}px ${s0.l - p.left}px round 20px)`;
    const D = 520, E = 'cubic-bezier(.2,.9,.25,1)', panelShadow = getComputedStyle(dlg).boxShadow;
    const halo = document.createElement('div');
    halo.className = 'halo';
    document.body.appendChild(halo);
    dlg.style.boxShadow = 'none';
    halo.animate([
      { left: s0.l + 'px', top: s0.t + 'px', width: (s0.r - s0.l) + 'px', height: (s0.b - s0.t) + 'px', borderRadius: '20px', boxShadow: panelShadow.replace(/rgba?\([^)]*\)/g, 'rgba(0, 0, 0, 0)') },
      { left: p.left + 'px', top: p.top + 'px', width: p.width + 'px', height: p.height + 'px', borderRadius: '24px', boxShadow: panelShadow },
    ], { duration: D, easing: E, fill: 'forwards' });
    const grow = dlg.animate([{ clipPath: inset0, opacity: .6 }, { clipPath: 'inset(0px 0px 0px 0px round 24px)', opacity: 1 }], { duration: D, easing: E });
    const settle = () => { dlg.style.boxShadow = ''; halo.remove(); };
    grow.onfinish = settle; grow.oncancel = settle;
    $('.ph', dlg).animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 120, easing: 'ease-out', fill: 'backwards' });
  }
  let closing = false;
  function close() {
    if (!dlg.open || closing) return;
    closing = true;
    stopDemos(); scrim.classList.remove('on');
    const parts = $$('.ph, .pb, .grab', dlg);
    const finish = () => {
      if (dlg.open) dlg.close();
      dlg.style.transform = '';
      parts.forEach((el) => el.getAnimations().forEach((x) => x.cancel()));
      scrim.hidden = true; document.documentElement.style.overflow = '';
      if (from) { from.style.opacity = ''; from.focus({ preventScroll: true }); setTimeout(() => from && (from.style.transition = ''), 300); }
      current = null; closing = false;
    };
    if (reduce || !from) return finish();
    // Closing: (1) the panel's content fades; (2) a plain card surface travels from the panel's rect
    // to the tile's exact rect (a separate element, so it can reach tiles wider than the panel);
    // (3) the real tile fades in under it while the surface fades away. Nothing is ever shown cropped.
    const p = dlg.getBoundingClientRect(), t = from.getBoundingClientRect();
    const FADE = 110, MOVE = 340, OUT = 140;
    const cs = getComputedStyle(from);
    parts.forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE, easing: 'ease-out', fill: 'forwards' }));
    setTimeout(() => {
      const ghost = document.createElement('div');
      ghost.className = 'ghost';
      Object.assign(ghost.style, { left: p.left + 'px', top: p.top + 'px', width: p.width + 'px', height: p.height + 'px', borderRadius: getComputedStyle(dlg).borderRadius });
      document.body.appendChild(ghost);
      dlg.close();
      const move = ghost.animate([
        { left: p.left + 'px', top: p.top + 'px', width: p.width + 'px', height: p.height + 'px', borderRadius: getComputedStyle(dlg).borderRadius, boxShadow: getComputedStyle(dlg).boxShadow },
        { left: t.left + 'px', top: t.top + 'px', width: t.width + 'px', height: t.height + 'px', borderRadius: cs.borderRadius, boxShadow: cs.boxShadow },
      ], { duration: MOVE, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' });
      // the surface is ~97% of the way there at 65% of the move (ease-out), so the crossfade starts then
      setTimeout(() => {
        if (from) { from.style.transition = `opacity ${OUT}ms ease-out`; from.style.opacity = ''; }
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT, delay: 40, easing: 'ease-in-out', fill: 'forwards' });
      }, MOVE * .65);
      move.onfinish = () => setTimeout(() => { ghost.remove(); finish(); }, Math.max(0, OUT + 40 - MOVE * .35));
    }, FADE);
  }
  window.openPanel = open;   // called by the loader in index.html
  $('#pClose').addEventListener('click', close);
  scrim.addEventListener('click', close);
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  addEventListener('resize', () => dlg.open && place());
  onLang.push(() => { if (dlg.open && current) { $('#pTitle').textContent = t(H[current][0]); $('#pSub').textContent = t(H[current][1]); translate(dlg); if (current === 'stack') renderStack(); if (current === 'github') renderGithub(); } });

  // swipe down to close on phones
  let y0 = null;
  const grip = $('.ph', dlg);
  grip.addEventListener('pointerdown', (e) => { if (!mobile() || e.target.closest('button')) return; y0 = e.clientY; try { grip.setPointerCapture(e.pointerId); } catch {} });
  grip.addEventListener('pointermove', (e) => { if (y0 == null) return; const dy = Math.max(0, e.clientY - y0); dlg.style.transform = `translateY(${dy}px)`; });
  const release = (e, ok) => {
    if (y0 == null) return;
    const dy = e.clientY - y0; y0 = null;
    if (ok && dy > 70) close(); else dlg.style.transform = '';
  };
  grip.addEventListener('pointerup', (e) => release(e, true));
  grip.addEventListener('pointercancel', (e) => release(e, false));

  function startDemos() {
    const timers = [];
    // odds ticker (illustrative)
    const o1 = $('#o1', dlg), o2 = $('#o2', dlg), od = $('#od', dlg); let p = 62;
    const step = () => {
      const prev = p; p = Math.max(8, Math.min(94, p + Math.round((Math.random() - .5) * 8)));
      o1.textContent = p + '¢'; o2.textContent = (100 / p).toFixed(2);
      const d = p - prev; od.textContent = d === 0 ? '' : (d > 0 ? '▲ ' : '▼ ') + Math.abs(d) + '¢';
      od.style.color = d > 0 ? 'var(--up)' : 'var(--down)';
    };
    if (!reduce) timers.push(setInterval(step, 1800));
    // sql typing
    const qs = LANG === 'pt' ? [
      ['quais casos citaram o art. 102 no ano passado?', 'SELECT <b>count</b>(*) FROM citations WHERE article = 102 AND year = 2025;'],
      ['5 jurisdições com mais decisões', 'SELECT jurisdiction, <b>count</b>(*) FROM decisions GROUP BY 1 ORDER BY 2 DESC LIMIT 5;'],
      ['multa média por setor desde 2020', 'SELECT sector, <b>avg</b>(fine_eur) FROM sanctions WHERE year >= 2020 GROUP BY 1;'],
    ] : [
      ['which cases cited art. 102 last year?', 'SELECT <b>count</b>(*) FROM citations WHERE article = 102 AND year = 2025;'],
      ['top 5 jurisdictions by decisions', 'SELECT jurisdiction, <b>count</b>(*) FROM decisions GROUP BY 1 ORDER BY 2 DESC LIMIT 5;'],
      ['average fine per sector since 2020', 'SELECT sector, <b>avg</b>(fine_eur) FROM sanctions WHERE year >= 2020 GROUP BY 1;'],
    ];
    const el = $('#sql', dlg); let qi = 0, alive = true;
    const show = (q, a, typing) => { el.innerHTML = `<span class="q">› ${q}</span>${typing ? '<span class="c"></span>' : ''}${a ? '<br>' + a : ''}`; };
    if (reduce) show(qs[0][0], qs[0][1]);
    else {
      const run = () => {
        if (!alive) return;
        const [q, a] = qs[qi++ % qs.length]; let i = 0;
        const ty = () => { if (!alive) return; show(q.slice(0, ++i), '', true); if (i < q.length) timers.push(setTimeout(ty, 26 + Math.random() * 30)); else timers.push(setTimeout(() => { show(q, a); timers.push(setTimeout(run, 3800)); }, 450)); };
        ty();
      };
      timers.push(setTimeout(run, 380));
    }
    return () => { alive = false; timers.forEach((x) => { clearInterval(x); clearTimeout(x); }); };
  }

  function renderStack() {
    const bar = $('#lbar2', dlg); if (!bar) return;
    drawLangBar(bar);
    bar.setAttribute('role', 'img'); bar.setAttribute('aria-label', LANGS.map(([n, c]) => `${n} ${c}`).join(', '));
    const other = { en: 'Other', pt: 'Outras' }[LANG];
    $('#lleg', dlg).innerHTML = LANGS.map(([n, c, col]) => `<span style="--c:${col}">${n === 'Other' ? other : n}<em>${c}</em></span>`).join('');
  }
  function renderGithub() {
    const bars = $('#bars2', dlg); if (!bars) return;
    $('#gC', dlg).textContent = fmtN(GH.total);
    $('#gA', dlg).innerHTML = `${GH.active}<small> / ${GH.w.length}</small>`;
    $('#gB', dlg).innerHTML = `${fmtN(GH.best[1])}<small> · ${GH.day(GH.best[0])}</small>`;
    $('#gR', dlg).textContent = '47';
    if (!bars.children.length) GH.draw(bars);
    bars.setAttribute('aria-label', `${fmtN(GH.total)} ${t('heat.commits')}`);
    const tip = $('#gTip', dlg), rest = () => { tip.textContent = t('g.asof', GH.day(HEAT.asOf, { day: 'numeric', month: 'short', year: 'numeric' })); };
    rest();
    bars.onpointerover = (e) => { const k = e.target.dataset.k; if (k != null) tip.innerHTML = t('heat.week', GH.w[k][1], GH.day(GH.w[k][0])); };
    bars.onpointerleave = rest;
    const ax = $('#axis2', dlg); ax.innerHTML = '';
    [0, 13, 26, 39, 51].forEach((k) => { const sp = document.createElement('span'); const m = GH.day(GH.w[k][0], { month: 'short' }); sp.textContent = m.charAt(0).toUpperCase() + m.slice(1); ax.appendChild(sp); });
    renderAct();
  }
  // latest public GitHub activity (own repos only)
  const ico = { push: '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M1 8h4.5M10.5 8H15"/></svg>', star: '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M8 1.8l1.9 4 4.3.4-3.3 2.9 1 4.3L8 11.2 4.1 13.4l1-4.3L1.8 6.2l4.3-.4z"/></svg>', repo: '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 2.5h9.5v9H4.5A1.5 1.5 0 0 0 3 13V2.5zM3 13a1.5 1.5 0 0 0 1.5 1.5h8v-3"/></svg>' };
  let events = null, evFailed = false, evPending = false;
  const ago = (tm) => new Intl.RelativeTimeFormat(LOC(), { numeric: 'auto', style: 'narrow' }).format(...(() => { const s = (new Date(tm) - Date.now()) / 1000; return Math.abs(s) < 3600 ? [Math.round(s / 60), 'minute'] : Math.abs(s) < 86400 ? [Math.round(s / 3600), 'hour'] : [Math.round(s / 86400), 'day']; })());
  const row = (e) => {
    const repo = esc(e.repo.name.replace(/^grigolin\//, ''));
    if (e.type === 'PushEvent') { const n = e.payload.size || e.payload.commits?.length || 1; return ['push', t('act.push', n, repo)]; }
    if (e.type === 'WatchEvent') return ['star', t('act.star', repo)];
    if (e.type === 'CreateEvent') return ['repo', t('act.create', e.payload.ref_type === 'repository' ? '' : esc(e.payload.ref_type || ''), repo)];
    if (e.type === 'PullRequestEvent') return ['repo', t('act.pr', e.payload.action === 'closed', repo)];
    return null;
  };
  function renderAct() {
    const ul = $('#act', dlg); if (!ul) return;
    if (evFailed) { ul.innerHTML = `<li>${ico.repo}<a class="what" href="https://github.com/grigolin" target="_blank" rel="noopener">${t('act.fail')}</a><span class="ago">↗</span></li>`; return; }
    if (!events) return;
    const own = [];
    events.filter((e) => e.repo.name.startsWith('grigolin/')).forEach((e) => {
      const prev = own[own.length - 1];
      if (prev && e.type === 'PushEvent' && prev.type === 'PushEvent' && prev.repo.name === e.repo.name) { prev.payload = { size: (prev.payload.size || 1) + (e.payload.size || e.payload.commits?.length || 1) }; return; }
      own.push({ ...e, payload: { ...e.payload } });
    });
    const rows = own.map((e) => [row(e), e]).filter((x) => x[0]).slice(0, 3);
    if (!rows.length) { evFailed = true; return renderAct(); }
    ul.innerHTML = rows.map(([[k, txt], e]) => `<li>${ico[k]}<a class="what" href="https://github.com/${esc(e.repo.name)}" target="_blank" rel="noopener">${txt}</a><span class="ago">${ago(e.created_at)}</span></li>`).join('');
  }
  function startStack() { renderStack(); return () => {}; }
  function startGithub() {
    renderGithub();
    if (!events && !evFailed && !evPending) (evPending = true, cachedJSON('desk.events', 'https://api.github.com/users/grigolin/events/public?per_page=30', 6e5).then((d) => { events = d; renderAct(); }).catch(() => { evFailed = true; renderAct(); }).finally(() => { evPending = false; }));
    return () => {};
  }
})();
