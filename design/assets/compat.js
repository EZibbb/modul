/* Modul comp — Compatibility finder: vendor → device type → model → modules by port-group. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const VENDORS = [
    { id:'cisco', name:'Cisco', mono:'CSC' },
    { id:'juniper', name:'Juniper', mono:'JNP' },
    { id:'huawei', name:'Huawei', mono:'HUA' },
    { id:'arista', name:'Arista', mono:'ARS' },
    { id:'mikrotik', name:'MikroTik', mono:'MTK' },
  ];
  const TYPES = [
    { id:'switch', name:'Коммутатор', icon:'<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 12h.01M11 12h.01M15 12h.01"/>' },
    { id:'router', name:'Маршрутизатор', icon:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>' },
    { id:'media', name:'Медиаконвертер', icon:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 12h8"/>' },
    { id:'nic', name:'Серверная карта', icon:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/>' },
  ];
  // models keyed by vendor (switch type)
  const MODELS = {
    cisco: [
      { id:'c9300', name:'Catalyst 9300', mpn:'C9300-48UXM', ports:'48×mGig + 8×SFP+' },
      { id:'n9k', name:'Nexus 9300', mpn:'N9K-C93180YC-EX', ports:'48×SFP28 + 6×QSFP28' },
      { id:'c3850', name:'Catalyst 3850', mpn:'WS-C3850-48XS', ports:'48×SFP+ + 4×QSFP+' },
    ],
    juniper: [
      { id:'ex4300', name:'EX4300', mpn:'EX4300-48T', ports:'48×RJ45 + 4×SFP+' },
      { id:'qfx5120', name:'QFX5120', mpn:'QFX5120-48Y', ports:'48×SFP28 + 8×QSFP28' },
    ],
    huawei: [ { id:'ce6851', name:'CE6800', mpn:'CE6851-48S6Q-HI', ports:'48×SFP+ + 6×QSFP+' } ],
    arista: [ { id:'7050x3', name:'7050X3', mpn:'DCS-7050SX3-48YC8', ports:'48×SFP28 + 8×QSFP28' } ],
    mikrotik: [ { id:'crs317', name:'CRS317', mpn:'CRS317-1G-16S+', ports:'16×SFP+' } ],
  };
  // result port-groups (sample for C9300 / 48UXM)
  const RESULT = {
    title: 'Catalyst 9300 · C9300-48UXM',
    groups: [
      { name:'Uplink', spec:'8×SFP+ 10G', modules:[
        { sku:'MC-SFP10G-LR', std:'10GBASE-LR', reach:'10 км', role:'main', sw:'IOS-XE 17.3', price:2900, stock:980 },
        { sku:'MC-SFP10G-SR', std:'10GBASE-SR', reach:'300 м', role:'alt', sw:'IOS-XE 17.3', price:1700, stock:1240 },
        { sku:'MC-SFP10G-ER', std:'10GBASE-ER', reach:'40 км', role:'alt', sw:'IOS-XE 17.3', price:7400, stock:0 },
      ]},
      { name:'Downlink mGig', spec:'48×100M–10G RJ45', modules:[
        { sku:'MC-GLC-T-RJ45', std:'1000BASE-T', reach:'100 м', role:'main', sw:'IOS-XE 16.9', price:1450, stock:640 },
        { sku:'MC-SFP10G-T', std:'10GBASE-T RJ45', reach:'30 м', role:'alt', sw:'IOS-XE 17.3', price:5200, stock:180 },
      ]},
    ],
  };

  const fmt = (n) => n.toLocaleString('ru-RU');
  const state = { vendor:'cisco', type:'switch', model:'c9300', kit:new Set() };

  function chipVendor(v) {
    const on = state.vendor === v.id;
    return `<button data-vendor="${v.id}" class="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${on?'border-primary bg-primary-muted text-primary':'border-border bg-card hover:bg-accent'}">
      <span class="flex h-7 w-10 items-center justify-center rounded ${on?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground'} text-2xs font-semibold">${v.mono}</span>${v.name}</button>`;
  }
  function chipType(t) {
    const on = state.type === t.id;
    return `<button data-type="${t.id}" class="flex flex-col items-center gap-2 rounded-lg border px-3 py-3 text-xs font-medium transition ${on?'border-primary bg-primary-muted text-primary':'border-border bg-card hover:bg-accent text-muted-foreground'}">
      <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${t.icon}</svg>${t.name}</button>`;
  }
  function rowModel(m) {
    const on = state.model === m.id;
    return `<button data-model="${m.id}" class="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${on?'border-primary bg-primary-muted':'border-border bg-card hover:bg-accent'}">
      <span class="flex h-8 w-8 items-center justify-center rounded-md ${on?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground'}"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 12h.01M11 12h.01"/></svg></span>
      <span class="min-w-0 flex-1"><span class="block text-sm font-medium ${on?'text-primary':''}">${m.name}</span><span class="mono block truncate text-2xs text-muted-foreground">${m.mpn} · ${m.ports}</span></span>
      ${on?'<svg class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>':'<svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>'}
    </button>`;
  }

  function modCard(m) {
    const inStock = m.stock > 0;
    const inKit = state.kit.has(m.sku);
    const main = m.role === 'main';
    return `<div class="flex items-center gap-3 rounded-lg border ${main?'border-primary/40 bg-primary-muted/30':'border-border bg-card'} p-3">
      <span class="inline-flex w-20 shrink-0 items-center justify-center gap-1 rounded-md ${main?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground'} px-2 py-1 text-2xs font-medium">${main?'Основной':'Альтернат.'}</span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2"><a href="product.html" class="mono text-sm font-medium text-primary hover:underline">${m.sku}</a><span class="text-xs text-muted-foreground">${m.std} · ${m.reach}</span></div>
        <div class="mono mt-0.5 text-2xs text-muted-foreground">мин. ПО ${m.sw} · ${inStock?`<span class="text-success">в наличии ${fmt(m.stock)}</span>`:'<span class="text-warning">под заказ</span>'}</div>
      </div>
      <div class="mono tnum shrink-0 text-sm font-semibold">${fmt(m.price)} ₽</div>
      <button data-kit="${m.sku}" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${inKit?'border-primary bg-primary text-primary-foreground':'border-border hover:bg-accent'}" aria-label="В комплект">
        ${inKit?'<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>':'<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>'}
      </button>
    </div>`;
  }

  function renderPickers() {
    $('#cf-vendors').innerHTML = VENDORS.map(chipVendor).join('');
    $('#cf-types').innerHTML = TYPES.map(chipType).join('');
    $('#cf-models').innerHTML = (MODELS[state.vendor] || []).map(rowModel).join('');
    $$('[data-vendor]').forEach(b => b.addEventListener('click', () => { state.vendor = b.dataset.vendor; state.model = (MODELS[state.vendor]||[{}])[0].id; renderPickers(); renderResult(); }));
    $$('[data-type]').forEach(b => b.addEventListener('click', () => { state.type = b.dataset.type; renderPickers(); }));
    $$('[data-model]').forEach(b => b.addEventListener('click', () => { state.model = b.dataset.model; renderPickers(); renderResult(); }));
  }

  function renderResult() {
    const r = RESULT;
    $('#cf-result-title').textContent = r.title;
    $('#cf-result').innerHTML = r.groups.map(g => `
      <div class="overflow-hidden rounded-xl border border-border">
        <div class="flex items-center justify-between border-b border-border bg-subtle px-4 py-2.5">
          <div class="flex items-center gap-2"><span class="mono inline-flex items-center gap-1.5 rounded-md bg-foreground px-2 py-1 text-2xs font-medium text-background">${g.name}</span><span class="text-sm font-medium">${g.spec}</span></div>
          <span class="text-2xs text-muted-foreground">${g.modules.length} совместимых</span>
        </div>
        <div class="space-y-2 p-3">${g.modules.map(modCard).join('')}</div>
      </div>`).join('');
    bindKit();
    renderKitBar();
  }

  function bindKit() {
    $$('[data-kit]').forEach(b => b.addEventListener('click', () => {
      const sku = b.dataset.kit;
      state.kit.has(sku) ? state.kit.delete(sku) : state.kit.add(sku);
      renderResult();
    }));
  }
  function allModules() { return RESULT.groups.flatMap(g => g.modules); }
  function renderKitBar() {
    const items = allModules().filter(m => state.kit.has(m.sku));
    const bar = $('#cf-kitbar');
    if (!items.length) { bar.classList.add('translate-y-full'); return; }
    bar.classList.remove('translate-y-full');
    const total = items.reduce((s, m) => s + m.price, 0);
    $('#cf-kit-count').textContent = items.length;
    $('#cf-kit-total').textContent = fmt(total) + ' ₽';
    $('#cf-kit-items').innerHTML = items.map(m => `<span class="mono inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs">${m.sku}<button data-unkit="${m.sku}" class="text-muted-foreground hover:text-destructive">✕</button></span>`).join('');
    $$('[data-unkit]').forEach(b => b.addEventListener('click', () => { state.kit.delete(b.dataset.unkit); renderResult(); }));
  }

  document.addEventListener('DOMContentLoaded', () => { renderPickers(); renderResult(); });
})();
