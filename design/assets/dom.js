/* Modul comp — AI DOM diagnostics: parse `show interface transceiver` → per-port analysis + verdict. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const SAMPLE = `switch# show interface transceiver detail

Te1/0/1
  Transceiver  : SFP+ 10GBASE-LR
  Temperature  : 41.2 C
  Voltage      : 3.31 V
  Current      : 6.83 mA
  Tx Power     : -2.10 dBm
  Rx Power     : -4.20 dBm

Te1/0/2
  Transceiver  : SFP+ 10GBASE-LR
  Temperature  : 39.8 C
  Voltage      : 3.29 V
  Current      : 6.51 mA
  Tx Power     : -2.30 dBm
  Rx Power     : -11.80 dBm

Te1/0/3
  Transceiver  : SFP+ 10GBASE-LR
  Temperature  : 67.4 C
  Voltage      : 3.33 V
  Current      : 10.9 mA
  Tx Power     : -1.90 dBm
  Rx Power     : -2.10 dBm`;

  // thresholds: [lowAlarm, lowWarn, highWarn, highAlarm]
  const TH = {
    temp:    [-5, 0, 70, 75],
    voltage: [2.97, 3.13, 3.46, 3.63],
    current: [2, 3, 11, 13],
    tx:      [-8.2, -5.2, -1.0, 0.5],
    rx:      [-14.4, -11.4, 0.5, 2.0],
  };
  const META = {
    temp:    { label:'Температура', unit:'°C' },
    voltage: { label:'Напряжение', unit:'В' },
    current: { label:'Ток смещения', unit:'mA' },
    tx:      { label:'Tx Power', unit:'dBm' },
    rx:      { label:'Rx Power', unit:'dBm' },
  };

  function classify(key, v) {
    const [la, lw, hw, ha] = TH[key];
    if (v < la || v > ha) return 'alarm';
    if (v < lw || v > hw) return 'warn';
    return 'norm';
  }

  function parse(text) {
    const ports = [];
    let cur = null;
    text.split(/\r?\n/).forEach(line => {
      const head = line.match(/^\s*((?:Te|Gi|Twe|Fo|Hu|Eth(?:ernet)?|xe-|ge-)[\w./-]*\d)\s*$/i);
      if (head) { cur = { port: head[1], type: '', m: {} }; ports.push(cur); return; }
      if (!cur) return;
      const tr = line.match(/Transceiver\s*:\s*(.+\S)/i); if (tr) cur.type = tr[1];
      const grab = (re, key) => { const m = line.match(re); if (m) cur.m[key] = parseFloat(m[1]); };
      grab(/Temperature\s*:?\s*(-?\d+(?:\.\d+)?)/i, 'temp');
      grab(/Voltage\s*:?\s*(-?\d+(?:\.\d+)?)/i, 'voltage');
      grab(/Current\s*:?\s*(-?\d+(?:\.\d+)?)/i, 'current');
      grab(/Tx\s*Power\s*:?\s*(-?\d+(?:\.\d+)?)/i, 'tx');
      grab(/Rx\s*Power\s*:?\s*(-?\d+(?:\.\d+)?)/i, 'rx');
    });
    return ports.filter(p => Object.keys(p.m).length);
  }

  const COLORS = { norm:'success', warn:'warning', alarm:'destructive' };
  const STATUS_RU = { norm:'норма', warn:'внимание', alarm:'авария' };

  function metricChip(key, v) {
    const st = classify(key, v);
    const c = COLORS[st];
    return `<div class="rounded-lg border border-${c}/30 bg-${c}-muted px-3 py-2">
      <div class="flex items-center justify-between"><span class="text-2xs text-muted-foreground">${META[key].label}</span><span class="h-1.5 w-1.5 rounded-full bg-${c}"></span></div>
      <div class="mono tnum mt-0.5 text-base font-semibold text-${c}">${v} <span class="text-2xs font-normal text-muted-foreground">${META[key].unit}</span></div>
    </div>`;
  }

  function rxBar(v) {
    // map -16..+2 dBm to 0..100
    const pct = Math.max(0, Math.min(100, ((v + 16) / 18) * 100));
    return `<div class="mt-2"><div class="relative h-2 overflow-hidden rounded-full bg-muted">
      <div class="absolute inset-y-0 left-0 w-[13%] bg-destructive/40"></div>
      <div class="absolute inset-y-0 left-[13%] w-[17%] bg-warning/40"></div>
      <div class="absolute inset-y-0 left-[30%] right-0 bg-success/25"></div>
      <div class="absolute inset-y-0 w-0.5 bg-foreground" style="left:${pct}%"></div>
    </div></div>`;
  }

  function portCard(p) {
    const states = Object.keys(p.m).map(k => classify(k, p.m[k]));
    const worst = states.includes('alarm') ? 'alarm' : states.includes('warn') ? 'warn' : 'norm';
    const c = COLORS[worst];
    return `<div class="overflow-hidden rounded-xl border border-border bg-card">
      <div class="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div class="flex items-center gap-2"><span class="mono text-sm font-semibold">${p.port}</span><span class="text-2xs text-muted-foreground">${p.type || '—'}</span></div>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-${c}-muted px-2.5 py-1 text-2xs font-medium text-${c}"><span class="h-1.5 w-1.5 rounded-full bg-${c}"></span>${STATUS_RU[worst]}</span>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
          ${['temp','voltage','current','tx','rx'].filter(k => k in p.m).map(k => metricChip(k, p.m[k])).join('')}
        </div>
        ${'rx' in p.m ? rxBar(p.m.rx) : ''}
      </div>
    </div>`;
  }

  function verdict(ports) {
    const flat = ports.flatMap(p => Object.keys(p.m).map(k => classify(k, p.m[k])));
    const alarms = ports.filter(p => Object.keys(p.m).some(k => classify(k, p.m[k]) === 'alarm'));
    const warns = ports.filter(p => Object.keys(p.m).some(k => classify(k, p.m[k]) === 'warn'));
    let c, title, note;
    if (alarms.length) { c='destructive'; title=`Авария на ${alarms.length} порт(ах)`; note=`Параметры за порогом alarm — требуется немедленная замена модуля или чистка трассы. Порты: ${alarms.map(p=>p.port).join(', ')}.`; }
    else if (warns.length) { c='warning'; title=`Внимание: ${warns.length} порт(ов) у порога`; note=`Параметры в зоне warning — запас на исходе. Проверьте коннекторы и затухание. Порты: ${warns.map(p=>p.port).join(', ')}.`; }
    else { c='success'; title='Все порты в норме'; note='Оптические параметры в пределах нормы с запасом. Действий не требуется.'; }
    const icon = c==='success' ? '<path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/>' : c==='warning' ? '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>' : '<path d="M18 6 6 18M6 6l12 12"/><circle cx="12" cy="12" r="9"/>';
    return `<div class="rounded-xl border border-${c}/30 bg-${c}-muted p-4">
      <div class="flex items-start gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-${c} text-white"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg></span>
        <div class="flex-1"><h3 class="text-sm font-semibold text-${c}">${title}</h3><p class="mt-0.5 text-xs text-foreground/80" style="text-wrap:pretty">${note}</p></div>
      </div>
      <div class="mono mt-3 flex flex-wrap gap-2 text-2xs">
        <span class="rounded border border-border bg-card px-2 py-1">портов: ${ports.length}</span>
        <span class="rounded border border-border bg-card px-2 py-1 text-success">норма: ${flat.filter(s=>s==='norm').length}</span>
        <span class="rounded border border-border bg-card px-2 py-1 text-warning">внимание: ${flat.filter(s=>s==='warn').length}</span>
        <span class="rounded border border-border bg-card px-2 py-1 text-destructive">авария: ${flat.filter(s=>s==='alarm').length}</span>
      </div>
    </div>`;
  }

  function run() {
    const text = $('#dom-input').value.trim();
    const out = $('#dom-output'), empty = $('#dom-empty');
    if (!text) { return; }
    const ports = parse(text);
    empty.classList.add('hidden');
    out.classList.remove('hidden');
    // streaming simulation
    out.innerHTML = `<div class="flex items-center gap-2 text-sm text-muted-foreground"><span class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3 3 3 0 0 1-1 5.6V18a3 3 0 0 1-6 0 3 3 0 0 1-6 0v-2.4A3 3 0 0 1 4 10a3 3 0 0 1 3-3V6a3 3 0 0 1 5-3z"/></svg></span><span class="mc-typing flex items-center gap-1"><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-200ms]"></span><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-100ms]"></span><span class="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"></span></span> анализирую ${ports.length} порт(ов)…</div>`;
    setTimeout(() => {
      if (!ports.length) {
        out.innerHTML = `<div class="rounded-xl border border-dashed border-border-strong bg-subtle p-8 text-center"><p class="text-sm font-medium">Не удалось распознать параметры</p><p class="mt-1 text-sm text-muted-foreground">Проверьте, что вставлен вывод <span class="mono">show interface transceiver</span> с полями Temperature / Voltage / Tx / Rx Power.</p></div>`;
        return;
      }
      out.innerHTML = `<div class="space-y-4">${verdict(ports)}<div class="space-y-3">${ports.map(portCard).join('')}</div></div>`;
    }, 800);
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#dom-run')?.addEventListener('click', run);
    $('#dom-sample')?.addEventListener('click', () => { $('#dom-input').value = SAMPLE; run(); });
    $('#dom-clear')?.addEventListener('click', () => { $('#dom-input').value = ''; $('#dom-output').classList.add('hidden'); $('#dom-empty').classList.remove('hidden'); });
  });
})();
