/* Desk: off-by-default tiles (arbitrage calculator, Termo). Loaded on demand by index.html, after first paint.
   A classic script on purpose: it uses the page's top-level consts ($, $$, t, store, later, reduce, editing, onLang...). */
/* ---------------- arbitrage calculator ---------------- */
later(() => {
  const a = $('#cA'), b = $('#cB'), s = $('#cS');
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
  const num = (el) => parseFloat(String(el.value).replace(',', '.'));
  const calc = () => {
    const A = num(a), B = num(b), T = num(s);
    if (!(A > 1 && B > 1 && T > 0)) { ['#cSA', '#cSB', '#cP'].forEach((id) => $(id).textContent = '—'); $('#cM').textContent = t('calc.bad'); return; }
    const inv = 1 / A + 1 / B, sa = T * (1 / A) / inv, sb = T * (1 / B) / inv, ret = T / inv - T, roi = (1 / inv - 1) * 100;
    $('#cSA').textContent = brl.format(sa); $('#cSB').textContent = brl.format(sb);
    const p = $('#cP'); p.textContent = (ret >= 0 ? '+' : '') + brl.format(ret); p.className = ret >= 0 ? 'pos' : 'neg';
    const pct = roi.toLocaleString(LOC(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    $('#cM').textContent = roi >= 0 ? t('calc.arb', pct) : t('calc.no', pct);
  };
  [a, b, s].forEach((el) => el.addEventListener('input', calc)); calc(); onLang.push(calc);
});

/* ---------------- termo ---------------- */
later(() => {
  const WORDS = 'TERMO CASAS PRAIA MUNDO PEDRA FESTA NOITE LIVRO CAMPO VERDE FOLHA BARCO CHUVA FORTE PRATO SONHO MANGA PORTA LINHA CARTA PLANO VENTO TEMPO GRUPO CERTO NUVEM SABOR TIGRE PIANO LIMAO'.split(' ');
  const board = $('#board'), inp = $('#tIn'), msg = $('#tMsg');
  let word, row, cur, over, streak = store.get('desk.termo') || 0, state = ['termo.start'];
  const say = (...k) => { state = k; msg.textContent = t(...k); };
  const streakTxt = () => { $('#tStreak').textContent = t('termo.streak', streak); };
  const rows = () => $$('.rw', board);
  const reset = () => {
    word = WORDS[Math.random() * WORDS.length | 0]; row = 0; cur = ''; over = false;
    board.innerHTML = Array.from({ length: 6 }, (_, r) => `<div class="rw${r ? '' : ' cur'}">${'<span></span>'.repeat(5)}</div>`).join('');
    say('termo.start');
  };
  const paint = () => { $$('span', rows()[row]).forEach((c, k) => { c.textContent = cur[k] || ''; }); };
  const submit = () => {
    if (cur.length < 5) return say('termo.five');
    const cells = $$('span', rows()[row]), res = Array(5).fill('x'), pool = word.split('');
    cur.split('').forEach((ch, k) => { if (word[k] === ch) { res[k] = 'g'; pool[k] = null; } });
    cur.split('').forEach((ch, k) => { if (res[k] !== 'g') { const j = pool.indexOf(ch); if (j > -1) { res[k] = 'y'; pool[j] = null; } } });
    cells.forEach((c, k) => { c.style.setProperty('--k', k); c.classList.add('flip'); setTimeout(() => c.classList.add(res[k]), reduce ? 0 : k * 90 + 250); });
    if (cur === word) { over = true; streak++; store.set('desk.termo', streak); streakTxt(); return say('termo.win'); }
    rows()[row].classList.remove('cur'); row++; cur = '';
    if (row === 6) { over = true; return say('termo.was', word); }
    rows()[row].classList.add('cur'); say('termo.left', 6 - row);
  };
  const key = (k) => {
    if (over || editing) return;
    if (k === 'Enter') return submit();
    if (k === 'Backspace') { cur = cur.slice(0, -1); return paint(); }
    if (/^[a-zA-Z]$/.test(k) && cur.length < 5) { cur += k.toUpperCase(); paint(); const c = $$('span', rows()[row])[cur.length - 1]; c.classList.remove('f'); void c.offsetWidth; c.classList.add('f'); }
  };
  board.addEventListener('keydown', (e) => { if (e.metaKey || e.ctrlKey || e.altKey) return; if (/^(Enter|Backspace|[a-zA-Z])$/.test(e.key)) { e.preventDefault(); key(e.key); } });
  board.addEventListener('click', () => { board.focus(); if (matchMedia('(pointer:coarse)').matches) { inp.value = ''; inp.focus(); } });
  inp.addEventListener('input', () => { const v = inp.value.slice(-1); inp.value = ''; if (v) key(v); });
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === 'Backspace') { e.preventDefault(); key(e.key); } });
  $('#tNew').onclick = () => { reset(); board.focus(); };
  reset(); streakTxt();
  onLang.push(() => { msg.textContent = t(...state); streakTxt(); });
});
