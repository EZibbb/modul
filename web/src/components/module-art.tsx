// Графика модулей. Два компонента:
//  • ModuleArt   — реалистичный трансивер для карточек товара/каталога (контекст: один товар).
//  • CategoryGlyph — цветокодированный глиф каналов для плиток категорий (распознаётся с первого взгляда).
// Линейная инженерная графика в наших токенах; оптика — cyan. Закрывает W04.

type Kind = "sfp" | "qsfp" | "cable" | "patch" | "wdm" | "generic";

function kindOf(ff?: string | null, cat?: string | null): Kind {
  const f = (ff ?? "").toUpperCase();
  const c = (cat ?? "").toLowerCase();
  if (c.includes("patch") || c.includes("патч")) return "patch";
  if (c.includes("dac") || c.includes("aoc") || f === "DAC" || f === "AOC") return "cable";
  if (c.includes("wdm")) return "wdm";
  if (f.startsWith("QSFP") || f.startsWith("OSFP")) return "qsfp";
  if (f.startsWith("SFP")) return "sfp";
  return "generic";
}

function lanesOf(ff?: string | null): number {
  const f = (ff ?? "").toUpperCase();
  if (f.includes("DD") || f.startsWith("OSFP")) return 8;
  if (f.startsWith("QSFP")) return 4;
  return 2; // SFP duplex
}

/* ============================ ModuleArt (товар/каталог) ============================ */

export function ModuleArt({ formFactor, category, className }: { formFactor?: string | null; category?: string | null; className?: string }) {
  const kind = kindOf(formFactor, category);
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden role="img">
      {kind === "sfp" && <Transceiver lanes={2} />}
      {kind === "qsfp" && <Transceiver lanes={lanesOf(formFactor)} wide />}
      {kind === "cable" && <Cable />}
      {kind === "patch" && <Patch />}
      {kind === "wdm" && <Wdm />}
      {kind === "generic" && <Transceiver lanes={2} />}
    </svg>
  );
}

const body = "text-muted-foreground/70";
const accent = "text-cyan";

function Transceiver({ lanes, wide }: { lanes: number; wide?: boolean }) {
  const h = wide ? 52 : 34;
  const y = 60 - h / 2;
  const bw = wide ? 104 : 96;
  const portX = 34 + bw;
  const ys = laneYs(lanes, 60, wide ? 36 : 22);
  return (
    <g strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="34" y={y} width={bw} height={h} rx="6" fill="hsl(var(--card))" />
        <rect x="22" y={60 - 9} width="12" height="18" rx="3" />
        <line x1="44" y1={y + 8} x2={34 + bw * 0.5} y2={y + 8} opacity="0.5" />
        <line x1="44" y1={y + 14} x2={34 + bw * 0.38} y2={y + 14} opacity="0.35" />
      </g>
      <g className={accent} stroke="currentColor">
        {ys.map((ly) => (
          <g key={ly}>
            <line x1={portX} y1={ly} x2="184" y2={ly} />
            <circle cx="186" cy={ly} r="2.4" fill="currentColor" stroke="none" />
          </g>
        ))}
      </g>
    </g>
  );
}

function laneYs(n: number, center: number, span: number): number[] {
  if (n <= 1) return [center];
  const step = span / (n - 1);
  return Array.from({ length: n }, (_, i) => Math.round(center - span / 2 + i * step));
}

function Cable() {
  return (
    <g strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="14" y="46" width="46" height="30" rx="5" fill="hsl(var(--card))" />
        <rect x="140" y="46" width="46" height="30" rx="5" fill="hsl(var(--card))" />
      </g>
      <g className={accent} stroke="currentColor">
        <path d="M60 61 C 92 61, 108 61, 140 61" strokeWidth={3} />
      </g>
    </g>
  );
}

function Patch() {
  return (
    <g strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="16" y="50" width="26" height="20" rx="3" fill="hsl(var(--card))" />
        <rect x="158" y="50" width="26" height="20" rx="3" fill="hsl(var(--card))" />
      </g>
      <g className={accent} stroke="currentColor">
        <path d="M42 60 C 80 34, 120 86, 158 60" strokeWidth={3} />
        <circle cx="42" cy="60" r="2.6" fill="currentColor" stroke="none" />
        <circle cx="158" cy="60" r="2.6" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}

function Wdm() {
  return (
    <g strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="22" y="48" width="56" height="26" rx="5" fill="hsl(var(--card))" />
        <path d="M104 42 L 130 60 L 104 78 Z" fill="hsl(var(--card))" />
        <line x1="78" y1="61" x2="104" y2="61" />
      </g>
      <g strokeWidth={3}>
        <line x1="130" y1="60" x2="182" y2="44" stroke="#22d3ee" />
        <line x1="130" y1="60" x2="184" y2="60" stroke="#3b82f6" />
        <line x1="130" y1="60" x2="182" y2="76" stroke="#a855f7" />
      </g>
    </g>
  );
}

/* ============================ CategoryGlyph (плитки категорий) ============================ */
// Цвет + число каналов делают каждую категорию различимой; читается и на тёмной теме.

const CAT_ACCENT: Record<string, string> = {
  sfp: "#38bdf8",
  "sfp-plus": "#22d3ee",
  sfp28: "#2dd4bf",
  "qsfp-plus": "#818cf8",
  qsfp28: "#60a5fa",
  "qsfp-dd": "#a78bfa",
  "dac-aoc": "#fb923c",
  patch: "#34d399",
  wdm: "#c084fc",
};

export function CategoryGlyph({ slug, formFactor, className }: { slug?: string | null; formFactor?: string | null; className?: string }) {
  const s = (slug ?? "").toLowerCase();
  const c = CAT_ACCENT[s] ?? "#38bdf8";
  const kind = kindOf(formFactor, s);
  const lanes = lanesOf(formFactor);
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-md ${className ?? ""}`} style={{ background: `${c}14`, color: c }}>
      <span aria-hidden className="absolute -right-5 -top-6 h-24 w-24 rounded-full" style={{ background: `${c}33`, filter: "blur(20px)" }} />
      <svg viewBox="0 0 200 110" fill="none" className="relative h-12 w-3/4" aria-hidden role="img">
        {kind === "cable" && <GlyphCable />}
        {kind === "patch" && <GlyphPatch />}
        {kind === "wdm" && <GlyphWdm />}
        {(kind === "sfp" || kind === "qsfp" || kind === "generic") && <GlyphLanes lanes={lanes} />}
      </svg>
    </div>
  );
}

// модуль + N светящихся каналов (1-2 → SFP, 4 → QSFP, 8 → QSFP-DD)
function GlyphLanes({ lanes }: { lanes: number }) {
  const h = lanes >= 8 ? 64 : lanes >= 4 ? 52 : 34;
  const y = 55 - h / 2;
  const ys = laneYs(lanes, 55, Math.min(h - 12, 56));
  return (
    <g stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y={y} width="78" height={h} rx="7" fill="currentColor" fillOpacity="0.14" />
      <rect x="10" y={55 - 11} width="12" height="22" rx="3" fill="currentColor" fillOpacity="0.14" />
      {ys.map((ly) => (
        <g key={ly}>
          <line x1="98" y1={ly} x2="176" y2={ly} />
          <circle cx="180" cy={ly} r="3.4" fill="currentColor" stroke="none" />
        </g>
      ))}
    </g>
  );
}

function GlyphCable() {
  return (
    <g stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="38" width="50" height="34" rx="6" fill="currentColor" fillOpacity="0.14" />
      <rect x="142" y="38" width="50" height="34" rx="6" fill="currentColor" fillOpacity="0.14" />
      <path d="M58 55 C 92 55, 108 55, 142 55" />
    </g>
  );
}

function GlyphPatch() {
  return (
    <g stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="42" width="30" height="26" rx="4" fill="currentColor" fillOpacity="0.14" />
      <rect x="160" y="42" width="30" height="26" rx="4" fill="currentColor" fillOpacity="0.14" />
      <path d="M40 55 C 84 24, 116 86, 160 55" />
      <circle cx="40" cy="55" r="3.4" fill="currentColor" stroke="none" />
      <circle cx="160" cy="55" r="3.4" fill="currentColor" stroke="none" />
    </g>
  );
}

function GlyphWdm() {
  return (
    <g strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <g stroke="currentColor">
        <rect x="14" y="40" width="56" height="30" rx="6" fill="currentColor" fillOpacity="0.14" />
        <path d="M96 36 L 126 55 L 96 74 Z" fill="currentColor" fillOpacity="0.14" />
        <line x1="70" y1="55" x2="96" y2="55" />
      </g>
      <g strokeWidth={3.4}>
        <line x1="126" y1="55" x2="186" y2="36" stroke="#22d3ee" />
        <line x1="126" y1="55" x2="190" y2="55" stroke="#60a5fa" />
        <line x1="126" y1="55" x2="186" y2="74" stroke="#c084fc" />
      </g>
    </g>
  );
}
