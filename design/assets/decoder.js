/* Modul comp — Module name decoder: split SKU/standard into meaningful segments with explanations. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // dictionaries
  const FF = { SFP:'SFP — 1G, один канал', 'SFP+':'SFP+ — 10G, один канал', SFP28:'SFP28 — 25G, один канал', QSFP:'QSFP — 40G, 4 канала', 'QSFP+':'QSFP+ — 40G, 4 канала', QSFP28:'QSFP28 — 100G, 4 канала', 'QSFP-DD':'QSFP-DD — 400G, 8 каналов', OSFP:'OSFP — 400/800G, 8 каналов' };
  const SPEED = { '1G':'1 Гбит/с', '10G':'10.3125 Гбит/с', '25G':'25.78 Гбит/с', '40G':'41.25 Гбит/с (4×10G)', '100G':'103.125 Гбит/с (4×25G)', '200G':'200 Гбит/с', '400G':'400 Гбит/с (8×50G)' };
  const REACH = {
    SR:{ t:'Short Reach', d:'многомод (MMF), 850 нм, до 300–400 м', band:'850' },
    SR4:{ t:'Short Reach ×4', d:'MMF, MPO-12, 4 канала, до 100 м', band:'850' },
    LR:{ t:'Long Reach', d:'одномод (SMF), 1310 нм, до 10 км', band:'1310' },
    LR4:{ t:'Long Reach ×4', d:'SMF, CWDM4, 1295–1309 нм, до 10 км', band:'1310' },
    LRM:{ t:'Long Reach Multimode', d:'MMF, 1310 нм, до 220 м', band:'1310' },
    DR:{ t:'Datacenter Reach', d:'SMF параллельный, 1310 нм, до 500 м', band:'1310' },
    DR4:{ t:'Datacenter Reach ×4', d:'SMF, MPO-12, 4 канала, до 500 м', band:'1310' },
    FR:{ t:'Far Reach', d:'SMF, 1310 нм, до 2 км', band:'1310' },
    FR4:{ t:'Far Reach ×4', d:'SMF, CWDM, 4 канала, до 2 км', band:'1310' },
    ER:{ t:'Extended Reach', d:'SMF, 1550 нм, до 40 км', band:'1550' },
    ER4:{ t:'Extended Reach ×4', d:'SMF, 4 канала, до 40 км', band:'1550' },
    ZR:{ t:'Z Reach', d:'SMF, 1550 нм, до 80 км', band:'1550' },
    BX:{ t:'BiDi', d:'одно волокно, разные λ Tx/Rx', band:'1310' },
    DAC:{ t:'Direct Attach Copper', d:'медный кабель, пассивный, до 5 м', band:'—' },
    AOC:{ t:'Active Optical Cable', d:'активный оптический кабель', band:'850' },
    T:{ t:'Twisted pair', d:'медь RJ45, витая пара', band:'—' },
    CWDM:{ t:'CWDM', d:'грубое спектральное уплотнение, сетка 20 нм', band:'CWDM' },
    DWDM:{ t:'DWDM', d:'плотное уплотнение, сетка ITU 50/100 ГГц', band:'DWDM' },
  };

  const SAMPLES = ['QSFP28-100G-LR4', 'MC-SFP10G-LR', 'SFP-25G-SR', 'QSFP-DD-400G-DR4', 'SFP+10G-BX-D', 'DWDM-SFP10G-C34'];

  function seg(label, value, kind) {
    const tone = { ff:'primary', speed:'cyan', reach:'success', extra:'muted-foreground', vendor:'muted-foreground' }[kind] || 'foreground';
    return { label, value, tone };
  }

  function decode(raw) {
    const s = raw.toUpperCase().replace(/\s+/g, '');
    const out = [];
    let rest = s;

    // vendor prefix MC-
    if (/^MC-?/.test(rest)) { out.push({ label:'Префикс', value:'MC', tone:'muted-foreground', note:'Производитель — Modul comp' }); rest = rest.replace(/^MC-?/, ''); }

    // form factor
    const ffMatch = rest.match(/^(QSFP-DD|QSFP28|QSFP\+|QSFP|SFP28|SFP\+|SFP|OSFP)/);
    if (ffMatch) { const ff = ffMatch[1]; out.push({ label:'Форм-фактор', value:ff, tone:'primary', note:FF[ff] || 'Тип корпуса модуля' }); rest = rest.slice(ff.length).replace(/^-/, ''); }

    // speed
    const spMatch = rest.match(/(\d{1,3}G)/);
    if (spMatch) { const sp = spMatch[1]; out.push({ label:'Скорость', value:sp, tone:'cyan', note:SPEED[sp] || 'Скорость канала' }); rest = rest.replace(sp, '').replace(/^-/, '').replace(/-$/, ''); }

    // reach / media code
    const codes = Object.keys(REACH).sort((a, b) => b.length - a.length);
    for (const code of codes) {
      const re = new RegExp(`(^|-)${code}(\\d?)(-|$)`);
      const m = rest.match(re);
      if (m) {
        const full = code + (m[2] || '');
        const info = REACH[code];
        out.push({ label:'Тип/дальность', value:full, tone:'success', note:`${info.t} — ${info.d}` });
        rest = rest.replace(full, '').replace(/--/, '-').replace(/^-|-$/g, '');
        break;
      }
    }

    // bidi direction / channel
    const bx = rest.match(/(^|-)(D|U)(-|$)/);
    if (bx) { out.push({ label:'Направление', value:bx[2], tone:'muted-foreground', note: bx[2]==='D'?'Downstream — Tx 1330 / Rx 1270 нм':'Upstream — Tx 1270 / Rx 1330 нм' }); rest = rest.replace(bx[0], '-').replace(/^-|-$/g, ''); }

    // dwdm/cwdm channel
    const ch = rest.match(/C(\d{2})/);
    if (ch) { out.push({ label:'Канал', value:'C'+ch[1], tone:'muted-foreground', note:`Номер спектрального канала по сетке ITU` }); rest = rest.replace(ch[0], '').replace(/^-|-$/g, ''); }

    // leftover
    if (rest && rest.length > 0 && rest !== '-') out.push({ label:'Доп.', value:rest.replace(/^-|-$/g,''), tone:'muted-foreground', note:'Дополнительный код производителя' });

    return out;
  }

  const TONE_CLASS = {
    'primary': 'border-primary/40 bg-primary-muted text-primary',
    'cyan': 'border-cyan/40 bg-cyan-muted text-cyan',
    'success': 'border-success/40 bg-success-muted text-success',
    'muted-foreground': 'border-border bg-muted text-muted-foreground',
    'foreground': 'border-border bg-card text-foreground',
  };

  function render(raw) {
    const segs = decode(raw);
    const empty = $('#dec-empty'), out = $('#dec-output');
    if (!segs.length) { empty.classList.remove('hidden'); out.classList.add('hidden'); return; }
    empty.classList.add('hidden'); out.classList.remove('hidden');

    // chips row
    $('#dec-chips').innerHTML = segs.map((s, i) =>
      `<div class="flex items-center gap-1.5">
        <div class="rounded-lg border ${TONE_CLASS[s.tone]} px-3 py-2 text-center">
          <div class="text-2xs opacity-70">${s.label}</div>
          <div class="mono text-base font-semibold">${s.value}</div>
        </div>
        ${i < segs.length - 1 ? '<span class="text-border-strong">–</span>' : ''}
      </div>`).join('');

    // explanation list
    $('#dec-list').innerHTML = segs.map((s, i) =>
      `<div class="flex items-start gap-3 border-b border-border p-3.5 last:border-0">
        <span class="mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${TONE_CLASS[s.tone]} text-2xs font-semibold">${i + 1}</span>
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-2"><span class="mono text-sm font-semibold">${s.value}</span><span class="text-2xs uppercase tracking-wide text-muted-foreground">${s.label}</span></div>
          <p class="mt-0.5 text-sm text-muted-foreground">${s.note || ''}</p>
        </div>
      </div>`).join('');

    $('#dec-full').textContent = raw.toUpperCase();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const inp = $('#dec-input');
    inp?.addEventListener('input', () => render(inp.value.trim()));
    $$('[data-sample]').forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.sample; render(b.dataset.sample); }));
    // initial
    inp.value = 'QSFP28-100G-LR4'; render(inp.value);
  });
})();
