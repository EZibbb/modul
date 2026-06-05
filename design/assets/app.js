/* Modul comp — shared interactive shell: Cmd+K palette + AI co-pilot drawer.
   Light, dependency-free. Mounts itself into <body> on load. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);

  // ---- markup injected once ----
  const tpl = document.createElement('div');
  tpl.innerHTML = `
  <!-- backdrop -->
  <div id="mc-scrim" class="fixed inset-0 z-[60] hidden bg-foreground/30 backdrop-blur-[2px]"></div>

  <!-- Cmd+K palette -->
  <div id="mc-cmdk" class="fixed left-1/2 top-[12vh] z-[70] hidden w-[min(640px,92vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
    <div class="flex items-center gap-2.5 border-b border-border px-4">
      <svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="mc-cmdk-input" placeholder="Поиск артикула, товара или команды…" class="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      <kbd class="mono rounded border border-border bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground">esc</kbd>
    </div>
    <div id="mc-cmdk-list" class="max-h-[52vh] overflow-y-auto p-2"></div>
    <div class="flex items-center justify-between border-t border-border bg-subtle px-4 py-2 text-2xs text-muted-foreground">
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1"><kbd class="mono rounded border border-border bg-card px-1">↑</kbd><kbd class="mono rounded border border-border bg-card px-1">↓</kbd> навигация</span>
        <span class="flex items-center gap-1"><kbd class="mono rounded border border-border bg-card px-1">↵</kbd> выбрать</span>
      </div>
      <span class="flex items-center gap-1.5"><span class="flex h-3.5 w-3.5 items-center justify-center rounded bg-primary text-[8px] text-primary-foreground">AI</span> подбор работает на ИИ</span>
    </div>
  </div>

  <!-- AI co-pilot drawer -->
  <aside id="mc-ai" class="fixed right-0 top-0 z-[70] hidden h-full w-[min(440px,100vw)] flex-col border-l border-border bg-background shadow-lg">
    <header class="flex items-center gap-3 border-b border-border px-5 py-3.5">
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1-1 5.6V18a3 3 0 0 1-6 0 3 3 0 0 1-6 0v-2.4A3 3 0 0 1 4 10a3 3 0 0 1 3-3V6a3 3 0 0 1 5-3z"/></svg></span>
      <div class="flex-1">
        <h2 class="text-sm font-semibold leading-tight">Инженерный со-пилот</h2>
        <p class="text-2xs text-muted-foreground">Подбор · совместимость · диагностика DOM</p>
      </div>
      <button data-mc-close="ai" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent" aria-label="Закрыть"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </header>
    <div id="mc-ai-stream" class="flex-1 space-y-4 overflow-y-auto px-5 py-5"></div>
    <div class="border-t border-border p-3">
      <div class="mb-2 flex flex-wrap gap-1.5" id="mc-ai-suggest">
        <button class="mc-ai-chip rounded-full border border-border bg-card px-2.5 py-1 text-2xs hover:bg-accent">Соединить два ЦОД, 80 км, 100G</button>
        <button class="mc-ai-chip rounded-full border border-border bg-card px-2.5 py-1 text-2xs hover:bg-accent">Аналог Cisco SFP-10G-LR</button>
        <button class="mc-ai-chip rounded-full border border-border bg-card px-2.5 py-1 text-2xs hover:bg-accent">Разобрать вывод DOM</button>
      </div>
      <div class="flex items-end gap-2 rounded-lg border border-input bg-card p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25">
        <textarea id="mc-ai-input" rows="1" placeholder="Опишите задачу или вставьте конфиг…" class="max-h-28 w-full resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"></textarea>
        <button id="mc-ai-send" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary-hover" aria-label="Отправить"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 14-7-7 14-2-5-5-2z"/></svg></button>
      </div>
    </div>
  </aside>`;
  document.body.appendChild(tpl);

  const scrim = $('#mc-scrim'), cmdk = $('#mc-cmdk'), ai = $('#mc-ai');

  // ---------- command palette ----------
  const ITEMS = [
    { g: 'Товары', t: 'MC-SFP10G-LR', d: '10GBASE-LR · 1310nm · 10км', meta: '2 900 ₽', href: 'product.html' },
    { g: 'Товары', t: 'MC-SFP10G-SR', d: '10GBASE-SR · 850nm · 300м', meta: '1 700 ₽', href: 'product.html' },
    { g: 'Товары', t: 'MC-QSFP100G-LR4', d: '100GBASE-LR4 · CWDM4 · 10км', meta: '22 500 ₽', href: 'product.html' },
    { g: 'Товары', t: 'MC-QSFP100G-DAC3', d: '100G DAC пассивный · 3м', meta: '5 400 ₽', href: 'product.html' },
    { g: 'Команды', t: 'Подбор совместимости', d: 'вендор → серия → модель', icon: 'compat', href: 'compatibility.html' },
    { g: 'Команды', t: 'Калькулятор оптбюджета', d: 'segments · коннекторы · сварки', icon: 'calc', href: 'calculator.html' },
    { g: 'Команды', t: 'Сравнение модулей', d: 'до 4 позиций', icon: 'compare', href: 'compare.html' },
    { g: 'Команды', t: 'ИИ-диагностика DOM', d: 'разбор show interface transceiver', icon: 'ai', href: 'dom-diagnostics.html' },
    { g: 'Команды', t: 'Декодер артикула', d: 'QSFP28-100G-LR4 по сегментам', icon: 'sku', href: 'decoder.html' },
    { g: 'Команды', t: 'Спецификация / корзина', d: 'позиции, промокод, запрос КП', icon: 'cart', href: 'cart.html' },
    { g: 'Команды', t: 'Личный кабинет', d: 'заказы, шаблоны, избранное', icon: 'user', href: 'account.html' },
    { g: 'Команды', t: 'Дизайн-система', d: 'токены и компоненты', icon: 'ds', href: 'design-system.html' },
    { g: 'ИИ', t: 'Спросить со-пилота…', d: 'подбор решения по задаче', icon: 'ai', action: 'ai' },
  ];
  let filtered = ITEMS.slice(), sel = 0;

  function iconSvg(name) {
    const p = {
      compat: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
      calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h2M8 18h2"/>',
      compare: '<path d="M3 6h18M3 12h18M3 18h18"/>',
      ai: '<path d="M12 3a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1-1 5.6V18a3 3 0 0 1-6 0 3 3 0 0 1-6 0v-2.4A3 3 0 0 1 4 10a3 3 0 0 1 3-3V6a3 3 0 0 1 5-3z"/>',
      sku: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v10M11 7v10M15 7v10"/>',
      cart: '<path d="M4 5h2l2 11h9l2-7H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
      ds: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    }[name] || '';
    return `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${p}</svg>`;
  }

  function renderList() {
    const list = $('#mc-cmdk-list');
    if (!filtered.length) { list.innerHTML = '<div class="px-3 py-8 text-center text-sm text-muted-foreground">Ничего не найдено</div>'; return; }
    let html = '', lastG = null;
    filtered.forEach((it, i) => {
      if (it.g !== lastG) { html += `<div class="px-2 pb-1 pt-2 text-2xs uppercase tracking-wide text-muted-foreground">${it.g}</div>`; lastG = it.g; }
      const active = i === sel;
      const ico = it.g === 'Товары' ? iconSvg('sku') : iconSvg(it.icon);
      html += `<button data-i="${i}" class="mc-row flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left ${active ? 'bg-accent' : 'hover:bg-accent/60'}">
        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border ${it.g==='ИИ'?'bg-primary text-primary-foreground border-transparent':'bg-card text-muted-foreground'}">${ico}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium ${it.g==='Товары'?'mono text-primary':''}">${it.t}</span>
          <span class="block truncate text-2xs text-muted-foreground">${it.d}</span>
        </span>
        ${it.meta ? `<span class="mono shrink-0 text-xs font-medium">${it.meta}</span>` : ''}
      </button>`;
    });
    list.innerHTML = html;
    list.querySelectorAll('.mc-row').forEach(b => {
      b.addEventListener('mousemove', () => { sel = +b.dataset.i; renderList(); });
      b.addEventListener('click', () => choose(filtered[+b.dataset.i]));
    });
  }
  function choose(it) {
    if (!it) return;
    if (it.action === 'ai') { closeAll(); openAI(); return; }
    if (it.href) location.href = it.href;
  }
  function filter(q) {
    q = q.trim().toLowerCase();
    filtered = !q ? ITEMS.slice() : ITEMS.filter(it => (it.t + ' ' + it.d + ' ' + it.g).toLowerCase().includes(q));
    sel = 0; renderList();
  }

  function openCmdk() { scrim.classList.remove('hidden'); cmdk.classList.remove('hidden'); const inp = $('#mc-cmdk-input'); inp.value=''; filter(''); setTimeout(()=>inp.focus(),20); }
  function closeAll() { scrim.classList.add('hidden'); cmdk.classList.add('hidden'); ai.classList.add('hidden'); ai.classList.remove('flex'); }

  // ---------- AI drawer ----------
  function bubble(role, html) {
    const wrap = document.createElement('div');
    if (role === 'user') {
      wrap.className = 'flex justify-end';
      wrap.innerHTML = `<div class="max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">${html}</div>`;
    } else {
      wrap.className = 'flex gap-2.5';
      wrap.innerHTML = `<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1-1 5.6V18a3 3 0 0 1-6 0 3 3 0 0 1-6 0v-2.4A3 3 0 0 1 4 10a3 3 0 0 1 3-3V6a3 3 0 0 1 5-3z"/></svg></span><div class="min-w-0 flex-1 space-y-2 text-sm">${html}</div>`;
    }
    $('#mc-ai-stream').appendChild(wrap);
    $('#mc-ai-stream').scrollTop = $('#mc-ai-stream').scrollHeight;
    return wrap;
  }
  function aiProductCard(sku, desc, price, badge) {
    return `<div class="rounded-lg border border-border bg-card p-3">
      <div class="flex items-center gap-2">
        <span class="mono text-sm font-medium text-primary">${sku}</span>
        <span class="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary-muted px-1.5 py-0.5 text-[10px] font-medium text-primary"><span class="flex h-2.5 w-2.5 items-center justify-center rounded-sm bg-primary text-[7px] text-primary-foreground">AI</span>${badge||'подобрано ИИ'}</span>
      </div>
      <p class="mt-1 text-xs text-muted-foreground">${desc}</p>
      <div class="mt-2.5 flex items-center justify-between">
        <span class="mono text-sm font-semibold">${price}</span>
        <button class="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover">+ в спецификацию</button>
      </div>
    </div>`;
  }
  function typing() {
    return bubble('ai', `<div class="mc-typing flex items-center gap-1 py-1"><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-200ms]"></span><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-100ms]"></span><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"></span></div>`);
  }
  function respond(q) {
    bubble('user', q);
    const t = typing();
    setTimeout(() => {
      t.remove();
      if (/dom|показ|transceiver|rx|tx/i.test(q)) {
        bubble('ai', `Разобрал вывод <span class="mono">show interface transceiver</span>. Все параметры в норме:
          <div class="mono mt-1 grid grid-cols-2 gap-1.5 text-2xs">
            <div class="flex justify-between rounded border border-border bg-subtle px-2 py-1"><span class="text-muted-foreground">Rx Power</span><span class="text-success">−4.2 dBm</span></div>
            <div class="flex justify-between rounded border border-border bg-subtle px-2 py-1"><span class="text-muted-foreground">Tx Power</span><span class="text-success">−2.1 dBm</span></div>
            <div class="flex justify-between rounded border border-border bg-subtle px-2 py-1"><span class="text-muted-foreground">Темп.</span><span class="text-success">41 °C</span></div>
            <div class="flex justify-between rounded border border-border bg-subtle px-2 py-1"><span class="text-muted-foreground">Ток</span><span class="text-success">6.8 mA</span></div>
          </div>
          <p class="text-xs text-muted-foreground">Запас по Rx: 8.8 дБ до порога аварии. Модуль исправен.</p>`);
      } else if (/цод|80|магистр|dwdm|100g/i.test(q)) {
        bubble('ai', `Для линии <b>ЦОД ↔ ЦОД, 80 км, 100G</b> собрал комплект с запасом по оптбюджету:
          ${aiProductCard('MC-QSFP100G-LR4', '100GBASE-LR4, CWDM4, 10км — ×2 на стороны', '22 500 ₽', 'основной')}
          <p class="text-xs text-muted-foreground">На 80 км нужен DWDM-транспондер + усилитель. Открыть расчёт в <a href="calculator.html" class="text-primary underline">калькуляторе оптбюджета</a>?</p>`);
      } else {
        bubble('ai', `Ближайший совместимый аналог с экономией vs OEM:
          ${aiProductCard('MC-SFP10G-LR', '10GBASE-LR, 1310nm, 10км, LC, DOM. Аналог Cisco SFP-10G-LR', '2 900 ₽', '−68% к OEM')}
          <p class="text-xs text-muted-foreground">Кодируется под Cisco на складе, тест перед отгрузкой. Добавить в спецификацию?</p>`);
      }
    }, 700);
  }
  function openAI() {
    scrim.classList.remove('hidden'); ai.classList.remove('hidden'); ai.classList.add('flex');
    if (!$('#mc-ai-stream').children.length) {
      bubble('ai', `Привет! Я инженерный со-пилот Modul comp. Помогу подобрать модули под оборудование, проверить совместимость, собрать решение под задачу или разобрать вывод DOM. С чего начнём?`);
    }
    setTimeout(()=>$('#mc-ai-input').focus(),20);
  }

  // ---------- wiring ----------
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmdk.classList.contains('hidden') ? openCmdk() : closeAll(); }
    if (e.key === 'Escape') closeAll();
    if (!cmdk.classList.contains('hidden')) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); renderList(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); renderList(); }
      if (e.key === 'Enter') { e.preventDefault(); choose(filtered[sel]); }
    }
  });
  scrim.addEventListener('click', closeAll);
  document.addEventListener('input', (e) => { if (e.target.id === 'mc-cmdk-input') filter(e.target.value); });
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-mc-open]'); if (o) { e.preventDefault(); o.dataset.mcOpen === 'ai' ? openAI() : openCmdk(); }
    const c = e.target.closest('[data-mc-close]'); if (c) closeAll();
    const chip = e.target.closest('.mc-ai-chip'); if (chip) { respond(chip.textContent.trim()); }
  });
  $('#mc-ai-send').addEventListener('click', () => { const v = $('#mc-ai-input').value.trim(); if (v) { respond(v); $('#mc-ai-input').value=''; } });
  $('#mc-ai-input').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#mc-ai-send').click(); } });

  window.MC = { openCmdk, openAI, closeAll };
})();
