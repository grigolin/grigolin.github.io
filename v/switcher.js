/* Version switcher shared by every design exploration. Remove once a direction is chosen. */
(() => {
  const versions = [
    ['atlas', 'Atlas'],
    ['plain', 'Plaintext'],
    ['index', 'Index'],
    ['ruler', 'Ruler'],
    ['desk', 'Desk'],
    ['ledger', 'Ledger'],
    ['os', 'Workspace'],
    ['sheet', 'Sheet'],
  ];
  if (new URLSearchParams(location.search).has('clean')) return;
  // Paths are relative so this works on GitHub Pages, a local server, or any static host.
  const parts = location.pathname.split('/').filter(Boolean);
  const file = parts[parts.length - 1] === 'index.html' ? 'index.html' : '';
  const slug = file ? parts[parts.length - 2] : parts[parts.length - 1];
  const i = versions.findIndex(([s]) => s === slug);
  if (i < 0) return;
  const go = (d) => { location.href = `../${versions[(i + d + versions.length) % versions.length][0]}/${file}`; };

  const css = `
  .vsw{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:2px;
    padding:4px;border-radius:999px;background:rgba(20,20,20,.86);color:#f4f4f4;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
    font:500 12px/1 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.01em;box-shadow:0 8px 30px rgba(0,0,0,.25),inset 0 0 0 1px rgba(255,255,255,.08);
    transition:opacity .25s, transform .25s}
  .vsw.hide{opacity:0;transform:translate(-50%,8px);pointer-events:none}
  .vsw a,.vsw button{all:unset;cursor:pointer;padding:7px 10px;border-radius:999px;color:inherit;white-space:nowrap}
  .vsw a:hover,.vsw button:hover{background:rgba(255,255,255,.12)}
  .vsw a:focus-visible,.vsw button:focus-visible{outline:2px solid #8ab4ff}
  .vsw .n{opacity:.5;font-variant-numeric:tabular-nums;margin-right:6px}
  .vsw .mid{min-width:118px;text-align:center}
  @media print{.vsw{display:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const el = document.createElement('nav');
  el.className = 'vsw'; el.setAttribute('aria-label', 'Design versions');
  el.innerHTML = `<button aria-label="Previous version" data-d="-1">←</button>
    <a class="mid" href="../${file}" title="All versions"><span class="n">${i + 1}/${versions.length}</span>${versions[i][1]}</a>
    <button aria-label="Next version" data-d="1">→</button>
    <button aria-label="Hide switcher" data-h>×</button>`;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-h')) el.classList.add('hide'); else go(+b.dataset.d);
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,[contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '[') go(-1);
    if (e.key === ']') go(1);
    if (e.key === '\\') el.classList.toggle('hide');
  });
  const mount = () => document.body.appendChild(el);
  document.body ? mount() : addEventListener('DOMContentLoaded', mount);
})();
