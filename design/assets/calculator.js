/* Modul comp — Optical budget calculator: line builder → margin bar → verdict → PDF. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // transceiver presets: { name, budget(dB), reachKm }
  const TX = {
    'MC-SFP10G-SR':  { name:'MC-SFP10G-SR · 10G 850нм',  budget:2.9,  reach:0.3 },
    'MC-SFP10G-LR':  { name:'MC-SFP10G-LR · 10G 1310нм', budget:6.2,  reach:10 },
    'MC-SFP10G-ER':  { name:'MC-SFP10G-ER · 10G 1550нм', budget:15.0, reach:40 },
    'MC-SFP10G-ZR':  { name:'MC-SFP10G-ZR · 10G 1550нм', budget:24.0, reach:80 },
    'MC-SFP25G-LR':  { name:'MC-SFP25G-LR · 25G 1310нм', budget:6.5,  reach:10 },
    'MC-QSFP100G-LR4':{ name:'MC-QSFP100G-LR4 · 100G',   budget:8.3,  reach:10 },
  };
  // fiber attenuation per km by wavelength band
  const FIBER_DB_KM = { '1310': 0.35, '1550': 0.22, '850': 3.0 };
  const CONN_DB = 0.5;   // per connector pair
  const SPLICE_DB = 0.1; // per fusion splice

  const state = {
    tx: 'MC-SFP10G-LR',
    band: '1310',
    segments: [ { len: 8.0 } ],
    connectors: 4,
    splices: 2,
    atten: 0,
    margin: 3.0, // required safety margin dB
  };

  const f = (n, d = 1) => n.toFixed(d);

  function calc() {
    const fiberKm = state.segments.reduce((s, x) => s + (+x.len || 0), 0);
    const fiberLoss = fiberKm * FIBER_DB_KM[state.band];
    const connLoss = state.connectors * CONN_DB;
    const spliceLoss = state.splices * SPLICE_DB;
    const attenLoss = +state.atten || 0;
    const totalLoss = fiberLoss + connLoss + spliceLoss + attenLoss;
    const budget = TX[state.tx].budget;
    const headroom = budget - totalLoss;
    const usableMargin = headroom - state.margin;
    return { fiberKm, fiberLoss, connLoss, spliceLoss, attenLoss, totalLoss, budget, headroom, usableMargin };
  }

  function renderSegments() {
    $('#calc-segments').innerHTML = state.segments.map((s, i) => `
      <div class="flex items-center gap-2">
        <span class="mono flex h-9 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-2xs text-muted-foreground">${i + 1}</span>
        <div class="relative flex-1">
          <input data-seg="${i}" type="number" step="0.1" min="0" value="${s.len}" class="mono h-9 w-full rounded-md border border-input bg-background pl-3 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25" />
          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-muted-foreground">км</span>
        </div>
        ${state.segments.length > 1 ? `<button data-segdel="${i}" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Удалить"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>` : '<span class="w-9"></span>'}
      </div>`).join('');
    $$('[data-seg]').forEach(inp => inp.addEventListener('input', e => { state.segments[+e.target.dataset.seg].len = +e.target.value; render(); }));
    $$('[data-segdel]').forEach(b => b.addEventListener('click', () => { state.segments.splice(+b.dataset.segdel, 1); renderSegments(); render(); }));
  }

  function render() {
    const r = calc();
    // breakdown
    $('#bd-fiber').textContent = f(r.fiberLoss, 2) + ' dB';
    $('#bd-fiber-note').textContent = `${f(r.fiberKm)} км × ${FIBER_DB_KM[state.band]} dB/км`;
    $('#bd-conn').textContent = f(r.connLoss, 2) + ' dB';
    $('#bd-conn-note').textContent = `${state.connectors} × ${CONN_DB} dB`;
    $('#bd-splice').textContent = f(r.spliceLoss, 2) + ' dB';
    $('#bd-splice-note').textContent = `${state.splices} × ${SPLICE_DB} dB`;
    $('#bd-atten').textContent = f(r.attenLoss, 2) + ' dB';
    $('#bd-total').textContent = f(r.totalLoss, 2) + ' dB';
    $('#bd-total2').textContent = f(r.totalLoss, 2) + ' dB';
    $('#bd-budget').textContent = f(r.budget, 1) + ' dB';
    $('#bd-budget2').textContent = f(r.budget, 1) + ' dB';
    $('#bd-budget-end').textContent = f(r.budget, 1) + ' dB';
    $('#bd-headroom').textContent = f(r.headroom, 2) + ' dB';

    // margin bar: loss vs budget
    const pct = Math.max(0, Math.min(100, (r.totalLoss / r.budget) * 100));
    const bar = $('#calc-bar');
    bar.style.width = pct + '%';
    const marginPct = Math.max(0, Math.min(100, ((r.budget - state.margin) / r.budget) * 100));
    $('#calc-marginline').style.left = marginPct + '%';

    // verdict
    let cls, icon, title, note;
    if (r.usableMargin >= 0) {
      cls = 'success'; bar.className = 'h-full rounded-l-full bg-success transition-all';
      icon = '<path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/>';
      title = 'Линия работоспособна';
      note = `Запас ${f(r.usableMargin, 2)} dB сверх требуемого резерва ${f(state.margin, 1)} dB.`;
    } else if (r.headroom >= 0) {
      cls = 'warning'; bar.className = 'h-full rounded-l-full bg-warning transition-all';
      icon = '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>';
      title = 'Работает, но без запаса';
      note = `Бюджет сходится, но резерв ниже ${f(state.margin, 1)} dB. Уменьшите потери или возьмите модуль с большим бюджетом.`;
    } else {
      cls = 'destructive'; bar.className = 'h-full rounded-l-full bg-destructive transition-all';
      icon = '<path d="M18 6 6 18M6 6l12 12"/><circle cx="12" cy="12" r="9"/>';
      title = 'Бюджета не хватает';
      note = `Дефицит ${f(Math.abs(r.headroom), 2)} dB. Нужен трансивер с бо́льшим бюджетом, усилитель или меньше потерь.`;
    }
    const v = $('#calc-verdict');
    v.className = `rounded-xl border p-4 border-${cls}/30 bg-${cls}-muted`;
    v.innerHTML = `<div class="flex items-start gap-3">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-${cls} text-white"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg></span>
      <div class="flex-1"><h3 class="text-sm font-semibold text-${cls}">${title}</h3><p class="mt-0.5 text-xs text-foreground/80">${note}</p></div>
      <div class="text-right"><div class="text-2xs text-muted-foreground">запас</div><div class="mono tnum text-lg font-semibold text-${cls}">${r.usableMargin >= 0 ? '+' : ''}${f(r.usableMargin, 1)}</div></div>
    </div>`;

    // suggest AI for negative
    $('#calc-ai').classList.toggle('hidden', r.usableMargin >= 0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // tx select
    const txBtn = $('#tx-btn'), txMenu = $('#tx-menu');
    $('#tx-label').textContent = TX[state.tx].name;
    txBtn?.addEventListener('click', () => txMenu.classList.toggle('hidden'));
    $('#tx-menu').innerHTML = Object.entries(TX).map(([k, t]) =>
      `<button data-tx="${k}" class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent"><span class="mono">${t.name}</span><span class="mono text-2xs text-muted-foreground">${t.budget} dB</span></button>`).join('');
    $$('[data-tx]').forEach(o => o.addEventListener('click', () => { state.tx = o.dataset.tx; $('#tx-label').textContent = TX[state.tx].name; txMenu.classList.add('hidden'); render(); }));
    document.addEventListener('click', e => { if (txBtn && !txBtn.contains(e.target) && !txMenu.contains(e.target)) txMenu.classList.add('hidden'); });

    // band
    $$('[data-band]').forEach(b => b.addEventListener('click', () => {
      state.band = b.dataset.band;
      $$('[data-band]').forEach(x => {
        const on = x.dataset.band === state.band;
        x.classList.toggle('border-primary', on); x.classList.toggle('bg-primary-muted', on); x.classList.toggle('text-primary', on);
        x.classList.toggle('border-border', !on); x.classList.toggle('text-muted-foreground', !on);
      });
      render();
    }));

    // steppers
    function stepper(id, key, min, step) {
      $(`#${id}-minus`)?.addEventListener('click', () => { state[key] = Math.max(min, +(state[key] - step).toFixed(1)); $(`#${id}-val`).textContent = state[key]; render(); });
      $(`#${id}-plus`)?.addEventListener('click', () => { state[key] = +(state[key] + step).toFixed(1); $(`#${id}-val`).textContent = state[key]; render(); });
    }
    stepper('conn', 'connectors', 0, 1);
    stepper('splice', 'splices', 0, 1);
    stepper('margin', 'margin', 0, 0.5);
    $('#atten')?.addEventListener('input', e => { state.atten = +e.target.value; render(); });

    // add segment
    $('#seg-add')?.addEventListener('click', () => { state.segments.push({ len: 1.0 }); renderSegments(); render(); });

    renderSegments();
    render();
  });
})();
