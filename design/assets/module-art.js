/* Modul comp — transceiver illustrations by form-factor. window.moduleArt(p) -> SVG string.
   Uses theme tokens for body/label so it adapts to light/dark; fixed gold contacts + cyan optics. */
(function () {
  const GOLD = '#C9A24B';

  function fingers(x, y0, y1, n) {
    let s = '';
    const gap = (y1 - y0) / (n * 2 - 1);
    for (let i = 0; i < n; i++) {
      const y = y0 + i * gap * 2;
      s += `<rect x="${x}" y="${y.toFixed(1)}" width="13" height="${gap.toFixed(1)}" rx="1" fill="${GOLD}"/>`;
    }
    return s;
  }
  function bore(cx, cy, r) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(var(--cyan-muted))" stroke="hsl(var(--cyan))" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${(r*0.34).toFixed(1)}" fill="hsl(var(--cyan))"/>`;
  }
  function mpo(x, y, w, h) {
    let dots = '';
    const cols = 6, rows = 2, px = w / (cols + 1), py = h / (rows + 1);
    for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++)
      dots += `<circle cx="${(x + c * px).toFixed(1)}" cy="${(y + r * py).toFixed(1)}" r="1.7" fill="hsl(var(--cyan))"/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="hsl(var(--foreground))" opacity="0.85"/>${dots}`;
  }
  function label(x, y, w, h) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="hsl(var(--muted))"/>`
      + `<rect x="${x+8}" y="${y+8}" width="${(w*0.52).toFixed(0)}" height="4" rx="2" fill="hsl(var(--foreground))" opacity="0.5"/>`
      + `<rect x="${x+8}" y="${y+18}" width="${(w*0.72).toFixed(0)}" height="4" rx="2" fill="hsl(var(--foreground))" opacity="0.26"/>`;
  }

  function moduleArt(p) {
    const ff = (p.ff || '').toUpperCase();
    const conn = (p.conn || '').toUpperCase();
    const isDac = /DAC/.test(ff) || p.media === 'DAC' || conn === 'QSFP28';
    const isQsfp = /^QSFP|^OSFP/.test(ff);
    const open = `<svg viewBox="0 0 220 120" class="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">`;

    if (isDac) {
      // body on the right + copper cable curving out to the left
      const bx = 118, by = 30, bw = 84, bh = 60;
      return open
        + `<path d="M118 60 C 78 60 86 98 44 98 L 16 98" stroke="hsl(var(--muted-foreground))" stroke-width="9" stroke-linecap="round" opacity="0.55"/>`
        + `<path d="M118 60 C 78 60 86 98 44 98 L 16 98" stroke="hsl(var(--muted-foreground))" stroke-width="3" stroke-linecap="round" opacity="0.35"/>`
        + `<rect x="104" y="50" width="18" height="20" rx="3" fill="hsl(var(--muted))" stroke="currentColor" stroke-width="2"/>`
        + `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="9" fill="hsl(var(--card))" stroke="currentColor" stroke-width="2.5"/>`
        + `<rect x="${bx+10}" y="${by+6}" width="${bw-20}" height="7" rx="3.5" fill="currentColor" opacity="0.06"/>`
        + label(bx + 14, by + 16, bw - 28, 30)
        + fingers(bx + bw - 2, by + 10, by + bh - 10, 7)
        + `</svg>`;
    }

    if (isQsfp) {
      const bx = 34, by = 24, bw = 156, bh = 76;
      const optical = conn === 'MPO' ? mpo(46, 40, 22, 44)
        : bore(54, 52, 7) + bore(54, 74, 7); // LR4: duplex LC bores
      return open
        + `<rect x="14" y="54" width="16" height="16" rx="4" fill="hsl(var(--primary))"/><rect x="26" y="59" width="12" height="6" rx="3" fill="hsl(var(--primary))"/>`
        + `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="hsl(var(--card))" stroke="currentColor" stroke-width="2.5"/>`
        + `<rect x="${bx+10}" y="${by+7}" width="${bw-20}" height="8" rx="4" fill="currentColor" opacity="0.06"/>`
        + optical
        + label(86, by + 18, 92, 40)
        + fingers(bx + bw - 2, by + 14, by + bh - 14, 9)
        + `</svg>`;
    }

    // SFP single-lane (default)
    const bx = 34, by = 34, bw = 156, bh = 58;
    const optical = conn === 'RJ45'
      ? `<rect x="46" y="48" width="22" height="30" rx="2" fill="hsl(var(--muted))" stroke="currentColor" stroke-width="2"/><path d="M52 78v6M62 78v6" stroke="currentColor" stroke-width="2"/>`
      : (conn.includes('SIMPLEX') || /BIDI/.test((p.std||'').toUpperCase())
        ? bore(54, 63, 8)
        : bore(54, 51, 7) + bore(54, 75, 7));
    return open
      + `<rect x="14" y="55" width="16" height="14" rx="4" fill="hsl(var(--primary))"/><rect x="26" y="59" width="12" height="6" rx="3" fill="hsl(var(--primary))"/>`
      + `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="9" fill="hsl(var(--card))" stroke="currentColor" stroke-width="2.5"/>`
      + `<rect x="${bx+10}" y="${by+6}" width="${bw-20}" height="7" rx="3.5" fill="currentColor" opacity="0.06"/>`
      + optical
      + label(80, by + 12, 86, 34)
      + fingers(bx + bw - 2, by + 10, by + bh - 10, 7)
      + `</svg>`;
  }

  window.moduleArt = moduleArt;
})();
