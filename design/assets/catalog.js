/* Modul comp — Catalog: data, render, faceted filtering, sort, view, compare tray. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- product data (realistic transceiver catalog) ----
  const P = [
    { sku:'MC-SFP10G-SR', ff:'SFP+', std:'10GBASE-SR', desc:'MMF · LC дуплекс', speed:10, media:'MMF', lambda:'850', reach:300, reachL:'300 м', conn:'LC', temp:'0…+70', dom:true, pwr:1.0, price:1700, oem:66, stock:1240, pop:98 },
    { sku:'MC-SFP10G-LR', ff:'SFP+', std:'10GBASE-LR', desc:'SMF · LC дуплекс', speed:10, media:'SMF', lambda:'1310', reach:10000, reachL:'10 км', conn:'LC', temp:'0…+70', dom:true, pwr:1.0, price:2900, oem:68, stock:980, pop:96 },
    { sku:'MC-SFP10G-ER', ff:'SFP+', std:'10GBASE-ER', desc:'SMF · LC дуплекс', speed:10, media:'SMF', lambda:'1550', reach:40000, reachL:'40 км', conn:'LC', temp:'0…+70', dom:true, pwr:1.5, price:7400, oem:64, stock:0, pop:71 },
    { sku:'MC-SFP10G-ZR', ff:'SFP+', std:'10GBASE-ZR', desc:'SMF · LC дуплекс', speed:10, media:'SMF', lambda:'1550', reach:80000, reachL:'80 км', conn:'LC', temp:'0…+70', dom:true, pwr:1.5, price:12800, oem:60, stock:64, pop:58 },
    { sku:'MC-SFP10G-LR-I', ff:'SFP+', std:'10GBASE-LR', desc:'Индустриальный −40…+85', speed:10, media:'SMF', lambda:'1310', reach:10000, reachL:'10 км', conn:'LC', temp:'−40…+85', dom:true, pwr:1.2, price:4200, oem:55, stock:210, pop:62 },
    { sku:'MC-SFP10G-BX-D', ff:'SFP+', std:'10G BiDi', desc:'Tx1330/Rx1270 · LC simplex', speed:10, media:'SMF', lambda:'1330/1270', reach:10000, reachL:'10 км', conn:'LC', temp:'0…+70', dom:true, pwr:1.0, price:3600, oem:58, stock:320, pop:67 },
    { sku:'MC-SFP1G-LX', ff:'SFP', std:'1000BASE-LX', desc:'SMF · LC дуплекс', speed:1, media:'SMF', lambda:'1310', reach:10000, reachL:'10 км', conn:'LC', temp:'0…+70', dom:true, pwr:0.5, price:950, oem:62, stock:1500, pop:84 },
    { sku:'MC-SFP25G-LR', ff:'SFP28', std:'25GBASE-LR', desc:'SMF · LC дуплекс · FEC', speed:25, media:'SMF', lambda:'1310', reach:10000, reachL:'10 км', conn:'LC', temp:'0…+70', dom:true, pwr:1.2, price:6100, oem:63, stock:140, pop:74 },
    { sku:'MC-SFP25G-SR', ff:'SFP28', std:'25GBASE-SR', desc:'MMF · LC дуплекс · FEC', speed:25, media:'MMF', lambda:'850', reach:100, reachL:'100 м', conn:'LC', temp:'0…+70', dom:true, pwr:1.0, price:4400, oem:60, stock:260, pop:70 },
    { sku:'MC-QSFP40G-SR4', ff:'QSFP+', std:'40GBASE-SR4', desc:'MMF · MPO-12 · 4×10G', speed:40, media:'MMF', lambda:'850', reach:150, reachL:'150 м', conn:'MPO', temp:'0…+70', dom:true, pwr:1.5, price:9800, oem:68, stock:110, pop:64 },
    { sku:'MC-QSFP100G-SR4', ff:'QSFP28', std:'100GBASE-SR4', desc:'MMF · MPO-12 · 4×25G', speed:100, media:'MMF', lambda:'850', reach:100, reachL:'100 м', conn:'MPO', temp:'0…+70', dom:true, pwr:3.5, price:12800, oem:70, stock:88, pop:79 },
    { sku:'MC-QSFP100G-LR4', ff:'QSFP28', std:'100GBASE-LR4', desc:'SMF · LC · CWDM4', speed:100, media:'SMF', lambda:'1295–1309', reach:10000, reachL:'10 км', conn:'LC', temp:'0…+70', dom:true, pwr:3.5, price:22500, oem:72, stock:0, pop:81 },
    { sku:'MC-QSFP100G-DAC3', ff:'QSFP28', std:'100G DAC', desc:'Passive · 3 м · QSFP28↔QSFP28', speed:100, media:'DAC', lambda:'—', reach:3, reachL:'3 м', conn:'QSFP28', temp:'0…+70', dom:false, pwr:0.1, price:5400, oem:55, stock:520, pop:88 },
    { sku:'MC-CWDM-10G-47', ff:'SFP+', std:'10G CWDM', desc:'λ1470 · SMF · LC · 40 км', speed:10, media:'SMF', lambda:'1470', reach:40000, reachL:'40 км', conn:'LC', temp:'0…+70', dom:true, pwr:1.5, price:8600, oem:57, stock:96, pop:49 },
  ];

  const FF_ICON = (p) => (window.moduleArt ? window.moduleArt(p) : '');

  const fmt = (n) => n.toLocaleString('ru-RU');
  const state = { speed: new Set(), media: new Set(), conn: new Set(), dom: new Set(), q: '', sort: 'pop', view: 'grid', compare: new Set() };

  function matches(p) {
    if (state.speed.size && !state.speed.has(String(p.speed))) return false;
    if (state.media.size && !state.media.has(p.media)) return false;
    if (state.conn.size && !state.conn.has(p.conn)) return false;
    if (state.dom.size) { const want = state.dom.has('yes'); if (state.dom.size === 1 && p.dom !== want) return false; }
    if (state.q) { const q = state.q.toLowerCase(); if (!(p.sku + ' ' + p.std + ' ' + p.desc).toLowerCase().includes(q)) return false; }
    return true;
  }
  function sorted(list) {
    const s = state.sort;
    return [...list].sort((a, b) =>
      s === 'price-asc' ? a.price - b.price :
      s === 'price-desc' ? b.price - a.price :
      s === 'speed' ? b.speed - a.speed :
      s === 'reach' ? b.reach - a.reach :
      b.pop - a.pop);
  }

  function card(p) {
    const inStock = p.stock > 0;
    const checked = state.compare.has(p.sku);
    return `<article class="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:border-border-strong hover:shadow-md">
      <div class="relative flex h-32 items-center justify-center overflow-hidden border-b border-border bg-gradient-to-br from-muted to-subtle text-foreground/55">
        <div class="w-[64%]">${FF_ICON(p)}</div>
        <span class="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full ${inStock?'bg-success-muted text-success':'bg-warning-muted text-warning'} px-2 py-0.5 text-2xs font-medium"><span class="h-1.5 w-1.5 rounded-full ${inStock?'bg-success':'bg-warning'}"></span>${inStock?'в наличии':'под заказ'}</span>
        <label class="absolute right-2.5 top-2.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border ${checked?'border-primary bg-primary text-primary-foreground':'border-border bg-card/80 text-muted-foreground'} backdrop-blur" title="В сравнение">
          <input type="checkbox" class="hidden" data-compare="${p.sku}" ${checked?'checked':''}>
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </label>
      </div>
      <div class="flex flex-1 flex-col p-3.5">
        <div class="flex items-center gap-2">
          <a href="product.html" class="mono text-sm font-medium text-primary hover:underline">${p.sku}</a>
          ${p.dom?'<span class="mono rounded border border-cyan/30 bg-cyan-muted px-1 py-0.5 text-[10px] font-medium text-cyan">DOM</span>':''}
        </div>
        <p class="mt-1 text-sm font-medium leading-snug">${p.std}</p>
        <p class="text-xs text-muted-foreground">${p.desc}</p>
        <dl class="mono mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-2xs text-muted-foreground">
          <div class="flex justify-between border-b border-dashed border-border pb-1"><dt>λ</dt><dd class="text-foreground">${p.lambda}</dd></div>
          <div class="flex justify-between border-b border-dashed border-border pb-1"><dt>Дальн.</dt><dd class="text-foreground">${p.reachL}</dd></div>
          <div class="flex justify-between border-b border-dashed border-border pb-1"><dt>Разъём</dt><dd class="text-foreground">${p.conn}</dd></div>
          <div class="flex justify-between border-b border-dashed border-border pb-1"><dt>°C</dt><dd class="text-foreground">${p.temp}</dd></div>
        </dl>
        <div class="mt-auto flex items-end justify-between pt-3">
          <div>
            <span class="mono inline-flex items-center rounded bg-success-muted px-1.5 py-0.5 text-2xs font-medium text-success">−${p.oem}% OEM</span>
            <div class="tnum mt-1 text-lg font-semibold">${fmt(p.price)} ₽</div>
          </div>
          <button class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary-hover" title="В спецификацию" aria-label="В спецификацию"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
      </div>
    </article>`;
  }

  function row(p) {
    const inStock = p.stock > 0;
    const checked = state.compare.has(p.sku);
    return `<tr class="border-b border-border transition hover:bg-accent">
      <td class="px-3 py-2.5"><label class="flex h-5 w-5 cursor-pointer items-center justify-center rounded border ${checked?'border-primary bg-primary text-primary-foreground':'border-border-strong'}"><input type="checkbox" class="hidden" data-compare="${p.sku}" ${checked?'checked':''}>${checked?'<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>':''}</label></td>
      <td class="px-3 py-2.5"><a href="product.html" class="mono font-medium text-primary hover:underline">${p.sku}</a></td>
      <td class="px-3 py-2.5 text-foreground/90">${p.std} <span class="text-muted-foreground">· ${p.desc}</span></td>
      <td class="mono tnum px-3 py-2.5 text-right">${p.speed}G</td>
      <td class="mono tnum px-3 py-2.5 text-right">${p.lambda}</td>
      <td class="mono tnum px-3 py-2.5 text-right">${p.reachL}</td>
      <td class="px-3 py-2.5 text-center">${p.dom?'<span class="text-success">✓</span>':'<span class="text-muted-foreground">—</span>'}</td>
      <td class="px-3 py-2.5 text-center">${inStock?`<span class="mono text-xs text-success">${fmt(p.stock)}</span>`:'<span class="text-2xs text-warning">заказ</span>'}</td>
      <td class="px-3 py-2.5 text-right"><span class="mono inline-flex items-center rounded bg-success-muted px-1.5 py-0.5 text-2xs font-medium text-success">−${p.oem}%</span></td>
      <td class="mono tnum px-3 py-2.5 text-right font-semibold">${fmt(p.price)} ₽</td>
      <td class="px-3 py-2.5 text-right"><button class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-card" aria-label="В спецификацию"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button></td>
    </tr>`;
  }

  function render() {
    const list = sorted(P.filter(matches));
    $('#cat-count').textContent = list.length;
    const wrap = $('#cat-results');
    if (!list.length) {
      wrap.innerHTML = `<div class="col-span-full rounded-lg border border-dashed border-border-strong bg-subtle p-12 text-center">
        <p class="text-sm font-medium">Ничего не найдено</p>
        <p class="mt-1 text-sm text-muted-foreground">Сбросьте часть фильтров или уточните запрос.</p>
        <button id="cat-reset2" class="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Сбросить фильтры</button>
      </div>`;
      $('#cat-reset2')?.addEventListener('click', resetAll);
      return;
    }
    if (state.view === 'grid') {
      wrap.className = 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3';
      wrap.innerHTML = list.map(card).join('');
    } else {
      wrap.className = 'block overflow-x-auto rounded-lg border border-border';
      wrap.innerHTML = `<table class="w-full text-sm"><thead><tr class="border-b border-border bg-subtle text-left text-xs text-muted-foreground">
        <th class="px-3 py-2.5"></th><th class="px-3 py-2.5 font-medium">Артикул</th><th class="px-3 py-2.5 font-medium">Стандарт</th>
        <th class="px-3 py-2.5 text-right font-medium">Скор.</th><th class="px-3 py-2.5 text-right font-medium">λ</th><th class="px-3 py-2.5 text-right font-medium">Дальн.</th>
        <th class="px-3 py-2.5 text-center font-medium">DOM</th><th class="px-3 py-2.5 text-center font-medium">Склад</th><th class="px-3 py-2.5 text-right font-medium">vs OEM</th><th class="px-3 py-2.5 text-right font-medium">Цена</th><th class="px-3 py-2.5"></th>
      </tr></thead><tbody>${list.map(row).join('')}</tbody></table>`;
    }
    bindCompare();
    renderChips();
  }

  function bindCompare() {
    $$('[data-compare]').forEach(cb => cb.addEventListener('change', () => {
      const sku = cb.dataset.compare;
      if (cb.checked) { if (state.compare.size >= 4) { cb.checked = false; flash('Можно сравнить до 4 модулей'); return; } state.compare.add(sku); }
      else state.compare.delete(sku);
      render(); renderTray();
    }));
  }

  // ---- active filter chips ----
  function activeList() {
    const out = [];
    state.speed.forEach(v => out.push(['speed', v, v + 'G']));
    state.media.forEach(v => out.push(['media', v, v]));
    state.conn.forEach(v => out.push(['conn', v, v]));
    state.dom.forEach(v => out.push(['dom', v, v === 'yes' ? 'с DOM' : 'без DOM']));
    return out;
  }
  function renderChips() {
    const box = $('#cat-chips'); const items = activeList();
    if (!items.length && !state.q) { box.innerHTML = '<span class="text-2xs text-muted-foreground">Фильтры не выбраны</span>'; return; }
    box.innerHTML = items.map(([k, v, label]) =>
      `<button data-chip="${k}:${v}" class="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">${label}<svg class="h-3 w-3 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`
    ).join('') + (items.length ? '<button id="cat-reset" class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-primary hover:bg-primary-muted">Сбросить всё</button>' : '');
    $$('[data-chip]', box).forEach(b => b.addEventListener('click', () => {
      const [k, v] = b.dataset.chip.split(':'); state[k].delete(v); syncChecks(); render();
    }));
    $('#cat-reset')?.addEventListener('click', resetAll);
  }
  function resetAll() { state.speed.clear(); state.media.clear(); state.conn.clear(); state.dom.clear(); state.q = ''; const s = $('#cat-search'); if (s) s.value = ''; syncChecks(); render(); }
  function syncChecks() {
    $$('[data-facet]').forEach(cb => { const [k, v] = cb.dataset.facet.split(':'); cb.checked = state[k].has(v); });
  }

  // ---- compare tray ----
  function renderTray() {
    const tray = $('#cat-tray'); const n = state.compare.size;
    const main = document.querySelector('main');
    if (!n) { tray.classList.add('translate-y-full'); main && main.classList.remove('pb-28'); return; }
    tray.classList.remove('translate-y-full');
    main && main.classList.add('pb-28');
    $('#tray-items').innerHTML = [...state.compare].map(sku =>
      `<span class="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs">${sku}<button data-untray="${sku}" class="text-muted-foreground hover:text-destructive" aria-label="Убрать">✕</button></span>`
    ).join('');
    $('#tray-count').textContent = n;
    $$('[data-untray]').forEach(b => b.addEventListener('click', () => { state.compare.delete(b.dataset.untray); syncChecks(); render(); renderTray(); }));
  }

  // ---- toasts ----
  let toastT;
  function flash(msg) {
    let t = $('#cat-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cat-toast'; t.className = 'fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-lg border border-border bg-popover px-4 py-2.5 text-sm shadow-lg transition'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(toastT); toastT = setTimeout(() => { t.style.opacity = '0'; }, 1800);
  }

  // ---- wiring ----
  function init() {
    // clone desktop facets into mobile offcanvas so both share state
    const offBody = $('#cat-offcanvas-body');
    if (offBody) offBody.innerHTML = $('#cat-filters').innerHTML;
    // facet checkboxes
    $$('[data-facet]').forEach(cb => cb.addEventListener('change', () => {
      const [k, v] = cb.dataset.facet.split(':');
      cb.checked ? state[k].add(v) : state[k].delete(v); syncChecks(); render();
    }));
    // search within
    $('#cat-search')?.addEventListener('input', e => { state.q = e.target.value; render(); });
    // sort
    $('#cat-sort')?.addEventListener('change', e => { state.sort = e.target.value; render(); });
    // view toggle
    $$('[data-view]').forEach(b => b.addEventListener('click', () => {
      state.view = b.dataset.view;
      $$('[data-view]').forEach(x => x.classList.toggle('bg-card', x.dataset.view === state.view));
      $$('[data-view]').forEach(x => x.classList.toggle('text-foreground', x.dataset.view === state.view));
      $$('[data-view]').forEach(x => x.classList.toggle('shadow-xs', x.dataset.view === state.view));
      $$('[data-view]').forEach(x => x.classList.toggle('text-muted-foreground', x.dataset.view !== state.view));
      render();
    }));
    // accordion
    $$('[data-acc]').forEach(h => h.addEventListener('click', () => {
      const body = h.nextElementSibling; const open = !body.classList.contains('hidden');
      body.classList.toggle('hidden', open); h.querySelector('svg')?.classList.toggle('rotate-180', !open);
    }));
    // mobile offcanvas
    $('#cat-mobile-open')?.addEventListener('click', () => { $('#cat-offcanvas').classList.remove('hidden'); document.body.style.overflow='hidden'; });
    $$('[data-off-close]').forEach(b => b.addEventListener('click', () => { $('#cat-offcanvas').classList.add('hidden'); document.body.style.overflow=''; }));
    render(); renderTray();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
