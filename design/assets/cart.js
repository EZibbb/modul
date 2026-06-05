/* Modul comp — Cart / Specification: line items (qty, firmware, comment), summary, promo, RFQ. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const FW = ['Cisco — Generic', 'Juniper — Junos', 'Arista — EOS', 'Huawei — VRP', 'MikroTik — RouterOS'];
  // tiered unit price by qty
  function unitPrice(base, qty) { return qty >= 50 ? Math.round(base * 0.83) : qty >= 10 ? Math.round(base * 0.91) : base; }

  let items = [
    { sku:'MC-SFP10G-LR', name:'SFP+ 10GBASE-LR, 1310нм, 10км, LC, DOM', base:2900, oem:9100, qty:24, fw:'Cisco — Generic', note:'' },
    { sku:'MC-QSFP100G-LR4', name:'QSFP28 100GBASE-LR4, CWDM4, 10км, LC', base:22500, oem:80000, qty:6, fw:'Cisco — Generic', note:'для spine N9K' },
    { sku:'MC-QSFP100G-DAC3', name:'QSFP28 100G DAC пассивный, 3 м', base:5400, oem:12000, qty:12, fw:'—', note:'' },
  ];
  let promo = null;
  const PROMOS = { 'MODUL10': 0.10, 'PARTNER': 0.15 };
  const PARTNER = true; // partner account → partner pricing note

  const fmt = (n) => n.toLocaleString('ru-RU');

  function calc() {
    let sum = 0, oemSum = 0;
    items.forEach(i => { sum += unitPrice(i.base, i.qty) * i.qty; oemSum += i.oem * i.qty; });
    const promoOff = promo ? Math.round(sum * PROMOS[promo]) : 0;
    const subtotal = sum - promoOff;
    const vat = Math.round(subtotal * 0.20);
    return { sum, oemSum, promoOff, subtotal, vat, total: subtotal, saving: oemSum - sum, count: items.reduce((s,i)=>s+i.qty,0) };
  }

  function row(i, idx) {
    const unit = unitPrice(i.base, i.qty);
    const tier = i.qty >= 50 ? '50+' : i.qty >= 10 ? '10–49' : '1–9';
    return `<div class="border-b border-border p-4 last:border-0">
      <div class="flex gap-3">
        <div class="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-gradient-to-br from-muted to-subtle text-foreground/70">
          <svg viewBox="0 0 64 30" class="h-7"><rect x="3" y="5" width="44" height="20" rx="3" fill="hsl(var(--card))" stroke="currentColor" stroke-width="2"/><rect x="9" y="10" width="28" height="10" rx="1.5" fill="hsl(var(--muted))"/><rect x="48" y="9" width="6" height="5" rx="1" fill="currentColor"/><rect x="48" y="16" width="6" height="5" rx="1" fill="currentColor"/></svg>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <a href="product.html" class="mono text-sm font-medium text-primary hover:underline">${i.sku}</a>
              <p class="truncate text-xs text-muted-foreground">${i.name}</p>
            </div>
            <button data-del="${idx}" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Удалить"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
          </div>
          <div class="mt-2.5 flex flex-wrap items-center gap-2">
            <!-- qty -->
            <div class="flex h-8 items-center rounded-md border border-input">
              <button data-qty="${idx}:-" class="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground">−</button>
              <input data-qtyval="${idx}" value="${i.qty}" class="mono h-full w-12 border-x border-input bg-transparent text-center text-sm outline-none" />
              <button data-qty="${idx}:+" class="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground">+</button>
            </div>
            <!-- firmware -->
            <div class="relative">
              <select data-fw="${idx}" class="mono h-8 appearance-none rounded-md border border-input bg-card pl-2.5 pr-7 text-xs outline-none focus:border-primary">
                ${(i.sku.includes('DAC') ? ['—'] : FW).map(f => `<option ${f===i.fw?'selected':''}>${f}</option>`).join('')}
              </select>
              <svg class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <span class="mono inline-flex items-center rounded bg-success-muted px-1.5 py-0.5 text-2xs font-medium text-success">−${Math.round((1-i.base/i.oem)*100)}% OEM</span>
            <button data-note="${idx}" class="inline-flex h-8 items-center gap-1 rounded-md border border-dashed border-border px-2 text-2xs text-muted-foreground hover:bg-accent"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>${i.note?'коммент.':'добавить коммент.'}</button>
          </div>
          ${i.note ? `<input data-noteval="${idx}" value="${i.note}" class="mt-2 h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-primary" placeholder="Комментарий к позиции" />` : ''}
          <div class="mt-2 flex items-center justify-between border-t border-dashed border-border pt-2">
            <span class="mono text-2xs text-muted-foreground">${fmt(unit)} ₽ × ${i.qty} <span class="rounded bg-muted px-1">${tier}</span></span>
            <span class="mono tnum text-sm font-semibold">${fmt(unit * i.qty)} ₽</span>
          </div>
        </div>
      </div>
    </div>`;
  }

  function render() {
    const list = $('#cart-list');
    if (!items.length) {
      list.innerHTML = `<div class="p-12 text-center"><p class="text-sm font-medium">Спецификация пуста</p><p class="mt-1 text-sm text-muted-foreground">Добавьте модули из <a href="catalog.html" class="text-primary hover:underline">каталога</a>.</p></div>`;
    } else {
      list.innerHTML = items.map(row).join('');
    }
    $('#cart-itemcount').textContent = items.length;

    const c = calc();
    $('#sum-positions').textContent = items.length + ' поз. · ' + fmt(c.count) + ' шт';
    $('#sum-gross').textContent = fmt(c.sum) + ' ₽';
    $('#sum-promo-row').classList.toggle('hidden', !promo);
    $('#sum-promo').textContent = '−' + fmt(c.promoOff) + ' ₽';
    $('#sum-vat').textContent = fmt(c.vat) + ' ₽';
    $('#sum-total').textContent = fmt(c.total) + ' ₽';
    $('#sum-saving').textContent = fmt(c.saving) + ' ₽';
    bind();
  }

  function bind() {
    $$('[data-qty]').forEach(b => b.addEventListener('click', () => {
      const [idx, op] = b.dataset.qty.split(':');
      const i = items[+idx]; i.qty = Math.max(1, i.qty + (op === '+' ? 1 : -1)); render();
    }));
    $$('[data-qtyval]').forEach(inp => inp.addEventListener('change', () => { const i = items[+inp.dataset.qtyval]; i.qty = Math.max(1, parseInt(inp.value) || 1); render(); }));
    $$('[data-del]').forEach(b => b.addEventListener('click', () => { items.splice(+b.dataset.del, 1); render(); }));
    $$('[data-fw]').forEach(s => s.addEventListener('change', () => { items[+s.dataset.fw].fw = s.value; }));
    $$('[data-note]').forEach(b => b.addEventListener('click', () => { const i = items[+b.dataset.note]; if (!i.note) i.note = ' '; render(); setTimeout(()=>$(`[data-noteval="${b.dataset.note}"]`)?.focus(),10); }));
    $$('[data-noteval]').forEach(inp => inp.addEventListener('input', () => { items[+inp.dataset.noteval].note = inp.value; }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#promo-apply')?.addEventListener('click', () => {
      const code = $('#promo-input').value.trim().toUpperCase();
      const msg = $('#promo-msg');
      if (PROMOS[code]) { promo = code; msg.textContent = `Промокод применён: −${PROMOS[code]*100}%`; msg.className = 'mt-1.5 text-2xs text-success'; }
      else { promo = null; msg.textContent = code ? 'Промокод не найден' : ''; msg.className = 'mt-1.5 text-2xs text-destructive'; }
      render();
    });
    // RFQ file attach label
    $('#rfq-file')?.addEventListener('change', e => { const f = e.target.files[0]; $('#rfq-file-label').textContent = f ? f.name : 'Прикрепить ТЗ / файл'; });
    $('#rfq-submit')?.addEventListener('click', () => {
      const m = $('#rfq-done'); m.classList.remove('hidden'); m.classList.add('flex');
    });
    $('#rfq-close')?.addEventListener('click', () => { const m=$('#rfq-done'); m.classList.add('hidden'); m.classList.remove('flex'); });
    render();
  });
})();
