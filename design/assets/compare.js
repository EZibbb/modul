/* Modul comp — Compare up to 4 modules: column layout, diff highlight, "only differences". */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // pool of modules available to add
  const POOL = {
    'MC-SFP10G-LR': { sku:'MC-SFP10G-LR', name:'SFP+ 10GBASE-LR', ff:'SFP+', std:'10GBASE-LR', speed:'10 Гбит/с', media:'SMF', lambda:'1310 нм', laser:'DFB', reach:'10 км', budget:'6.2 dB', conn:'LC', temp:'0…+70 °C', dom:'Есть', pwr:'1.0 Вт', cert:'CE·FCC·RoHS', price:2900, oem:68, stock:'980' },
    'MC-SFP10G-SR': { sku:'MC-SFP10G-SR', name:'SFP+ 10GBASE-SR', ff:'SFP+', std:'10GBASE-SR', speed:'10 Гбит/с', media:'MMF', lambda:'850 нм', laser:'VCSEL', reach:'300 м', budget:'2.9 dB', conn:'LC', temp:'0…+70 °C', dom:'Есть', pwr:'1.0 Вт', cert:'CE·FCC·RoHS', price:1700, oem:66, stock:'1 240' },
    'MC-SFP10G-ER': { sku:'MC-SFP10G-ER', name:'SFP+ 10GBASE-ER', ff:'SFP+', std:'10GBASE-ER', speed:'10 Гбит/с', media:'SMF', lambda:'1550 нм', laser:'EML', reach:'40 км', budget:'15.0 dB', conn:'LC', temp:'0…+70 °C', dom:'Есть', pwr:'1.5 Вт', cert:'CE·FCC·RoHS', price:7400, oem:64, stock:'под заказ' },
    'MC-SFP25G-LR': { sku:'MC-SFP25G-LR', name:'SFP28 25GBASE-LR', ff:'SFP28', std:'25GBASE-LR', speed:'25 Гбит/с', media:'SMF', lambda:'1310 нм', laser:'DFB', reach:'10 км', budget:'6.5 dB', conn:'LC', temp:'0…+70 °C', dom:'Есть', pwr:'1.2 Вт', cert:'CE·FCC·RoHS', price:6100, oem:63, stock:'140' },
    'MC-SFP10G-BX-D': { sku:'MC-SFP10G-BX-D', name:'SFP+ 10G BiDi', ff:'SFP+', std:'10G BiDi', speed:'10 Гбит/с', media:'SMF', lambda:'1330/1270 нм', laser:'DFB', reach:'10 км', budget:'9.0 dB', conn:'LC simplex', temp:'0…+70 °C', dom:'Есть', pwr:'1.0 Вт', cert:'CE·FCC·RoHS', price:3600, oem:58, stock:'320' },
    'MC-QSFP100G-LR4': { sku:'MC-QSFP100G-LR4', name:'QSFP28 100GBASE-LR4', ff:'QSFP28', std:'100GBASE-LR4', speed:'100 Гбит/с', media:'SMF', lambda:'1295–1309 нм', laser:'DFB', reach:'10 км', budget:'8.3 dB', conn:'LC', temp:'0…+70 °C', dom:'Есть', pwr:'3.5 Вт', cert:'CE·FCC·RoHS', price:22500, oem:72, stock:'под заказ' },
  };
  const ROWS = [
    ['ff','Форм-фактор'], ['std','Стандарт'], ['speed','Скорость'], ['media','Тип среды'],
    ['lambda','Длина волны'], ['laser','Тип лазера'], ['reach','Дальность'], ['budget','Оптбюджет'],
    ['conn','Разъём'], ['temp','Темп. диапазон'], ['dom','DOM/DDM'], ['pwr','Потребление'], ['cert','Сертификаты'],
  ];
  const fmt = (n) => n.toLocaleString('ru-RU');

  let cols = ['MC-SFP10G-LR', 'MC-SFP10G-SR', 'MC-SFP25G-LR']; // preselected
  let onlyDiff = false;

  function rowDiffers(key) {
    const vals = cols.map(c => POOL[c][key]);
    return new Set(vals).size > 1;
  }

  function render() {
    const n = cols.length;
    $('#cmp-count').textContent = n;
    // header cards
    const addCol = n < 4 ? `<th class="w-64 p-2 align-top">
      <button data-add class="flex h-full min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-subtle text-muted-foreground transition hover:border-primary hover:text-primary">
        <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14"/></svg><span class="text-sm font-medium">Добавить модуль</span></button></th>` : '';
    const headCells = cols.map(c => {
      const p = POOL[c];
      return `<th class="w-64 p-2 align-top">
        <div class="relative rounded-xl border border-border bg-card p-4 text-left">
          <button data-remove="${c}" class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Убрать"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
          <div class="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-muted to-subtle p-3 text-foreground/55">
            <div class="w-[78%]">${window.moduleArt ? window.moduleArt(p) : ''}</div>
          </div>
          <a href="product.html" class="mono mt-3 block text-sm font-medium text-primary hover:underline">${p.sku}</a>
          <p class="mt-0.5 text-xs text-muted-foreground">${p.name}</p>
          <div class="mt-2 flex items-baseline gap-2"><span class="tnum text-lg font-semibold">${fmt(p.price)} ₽</span><span class="mono rounded bg-success-muted px-1.5 py-0.5 text-2xs font-medium text-success">−${p.oem}%</span></div>
          <button class="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-medium text-primary-foreground hover:bg-primary-hover"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>В спецификацию</button>
        </div></th>`;
    }).join('');
    $('#cmp-head').innerHTML = `<th class="sticky left-0 z-10 w-44 bg-background p-2 align-bottom"><span class="text-2xs uppercase tracking-wide text-muted-foreground">Параметр</span></th>${headCells}${addCol}`;

    // body rows
    const body = ROWS.filter(([k]) => !onlyDiff || rowDiffers(k)).map(([k, label]) => {
      const diff = rowDiffers(k);
      const cells = cols.map(c => {
        const v = POOL[c][k];
        return `<td class="border-l border-border px-4 py-2.5 text-sm ${diff?'bg-warning-muted/40 font-medium':''}">${v}</td>`;
      }).join('');
      const pad = n < 4 ? '<td class="border-l border-border"></td>' : '';
      return `<tr class="border-b border-border">
        <th class="sticky left-0 z-10 bg-background px-4 py-2.5 text-left text-sm font-normal text-muted-foreground">${label}${diff?'<span class="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-warning align-middle"></span>':''}</th>
        ${cells}${pad}</tr>`;
    }).join('');
    // price row
    const priceCells = cols.map(c => `<td class="border-l border-border px-4 py-3"><div class="tnum text-base font-semibold">${fmt(POOL[c].price)} ₽</div><div class="mono text-2xs text-success">−${POOL[c].oem}% к OEM</div></td>`).join('');
    const pricePad = n < 4 ? '<td class="border-l border-border"></td>' : '';
    $('#cmp-body').innerHTML = body + `<tr class="bg-subtle/50"><th class="sticky left-0 z-10 bg-subtle px-4 py-3 text-left text-sm font-semibold">Цена</th>${priceCells}${pricePad}</tr>`;

    bind();
  }

  function bind() {
    $$('[data-remove]').forEach(b => b.addEventListener('click', () => { cols = cols.filter(c => c !== b.dataset.remove); render(); }));
    $$('[data-add]').forEach(b => b.addEventListener('click', openPicker));
  }

  // add-module picker
  function openPicker() {
    const avail = Object.keys(POOL).filter(k => !cols.includes(k));
    const m = $('#cmp-picker');
    $('#cmp-picker-list').innerHTML = avail.map(k => {
      const p = POOL[k];
      return `<button data-pick="${k}" class="flex w-full items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left hover:bg-accent">
        <span class="min-w-0 flex-1"><span class="mono block text-sm font-medium text-primary">${p.sku}</span><span class="block truncate text-xs text-muted-foreground">${p.name} · ${p.reach}</span></span>
        <span class="mono tnum text-sm font-semibold">${fmt(p.price)} ₽</span></button>`;
    }).join('') || '<p class="px-3 py-6 text-center text-sm text-muted-foreground">Все доступные модули уже добавлены</p>';
    m.classList.remove('hidden'); m.classList.add('flex');
    $$('[data-pick]').forEach(b => b.addEventListener('click', () => { if (cols.length < 4) cols.push(b.dataset.pick); closePicker(); render(); }));
  }
  function closePicker() { const m = $('#cmp-picker'); m.classList.add('hidden'); m.classList.remove('flex'); }

  document.addEventListener('DOMContentLoaded', () => {
    $('#cmp-onlydiff')?.addEventListener('change', e => { onlyDiff = e.target.checked; render(); });
    $('#cmp-picker-close')?.addEventListener('click', closePicker);
    $('#cmp-picker-scrim')?.addEventListener('click', closePicker);
    render();
  });
})();
