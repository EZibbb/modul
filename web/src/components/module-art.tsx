// Стилизованный SVG-арт модуля по форм-фактору — без растровых картинок (закрывает W04).
// Линейная инженерная графика в наших токенах: корпус — muted-foreground, оптика — cyan.

type Props = { formFactor?: string | null; category?: string | null; className?: string };

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

export function ModuleArt({ formFactor, category, className }: Props) {
  const kind = kindOf(formFactor, category);
  return (
    <svg viewBox="0 0 200 120" fill="none" className={className} aria-hidden role="img">
      {kind === "sfp" && <Sfp />}
      {kind === "qsfp" && <Qsfp />}
      {kind === "cable" && <Cable />}
      {kind === "patch" && <Patch />}
      {kind === "wdm" && <Wdm />}
      {kind === "generic" && <Generic />}
    </svg>
  );
}

const body = "text-muted-foreground/70";
const accent = "text-cyan";

// SFP / SFP+ / SFP28 — компактный модуль + дуплекс LC + волокно
function Sfp() {
  return (
    <g strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="34" y="44" width="96" height="34" rx="6" fill="hsl(var(--card))" />
        <rect x="24" y="52" width="12" height="18" rx="3" />
        <line x1="44" y1="52" x2="80" y2="52" opacity="0.5" />
        <line x1="44" y1="58" x2="72" y2="58" opacity="0.35" />
      </g>
      <g className={accent} stroke="currentColor">
        <rect x="130" y="50" width="13" height="9" rx="2" fill="hsl(var(--cyan) / 0.15)" />
        <rect x="130" y="63" width="13" height="9" rx="2" fill="hsl(var(--cyan) / 0.15)" />
        <line x1="143" y1="55" x2="178" y2="55" />
        <line x1="143" y1="68" x2="178" y2="68" />
        <circle cx="180" cy="55" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="180" cy="68" r="2.4" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}

// QSFP+ / QSFP28 / QSFP-DD — шире, 4 линии, MPO-порт
function Qsfp() {
  return (
    <g strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="30" y="34" width="104" height="52" rx="7" fill="hsl(var(--card))" />
        <rect x="20" y="46" width="12" height="28" rx="3" />
        <line x1="42" y1="44" x2="92" y2="44" opacity="0.5" />
        <line x1="42" y1="50" x2="80" y2="50" opacity="0.35" />
      </g>
      <g className={accent} stroke="currentColor">
        <rect x="134" y="42" width="15" height="36" rx="3" fill="hsl(var(--cyan) / 0.12)" />
        {[50, 58, 66].map((y) => (
          <line key={y} x1="149" y1={y} x2="182" y2={y} />
        ))}
        <circle cx="184" cy="58" r="2.4" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}

// DAC / AOC — модуль + кабель к коннектору
function Cable() {
  return (
    <g strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="14" y="46" width="46" height="30" rx="5" fill="hsl(var(--card))" />
        <rect x="140" y="46" width="46" height="30" rx="5" fill="hsl(var(--card))" />
      </g>
      <g className={accent} stroke="currentColor">
        <path d="M60 61 C 92 61, 108 61, 140 61" />
        <path d="M60 56 C 92 70, 108 70, 140 66" opacity="0.4" />
      </g>
    </g>
  );
}

// Патч-корд — волоконный кабель с LC-коннекторами
function Patch() {
  return (
    <g strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="16" y="50" width="26" height="20" rx="3" fill="hsl(var(--card))" />
        <rect x="158" y="50" width="26" height="20" rx="3" fill="hsl(var(--card))" />
      </g>
      <g className={accent} stroke="currentColor">
        <path d="M42 60 C 80 36, 120 84, 158 60" />
        <circle cx="42" cy="60" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="158" cy="60" r="2.4" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}

// CWDM / DWDM — модуль + призма + спектр
function Wdm() {
  return (
    <g strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round">
      <g className={body} stroke="currentColor">
        <rect x="22" y="48" width="60" height="26" rx="5" fill="hsl(var(--card))" />
        <path d="M104 44 L 128 60 L 104 76 Z" fill="hsl(var(--card))" />
        <line x1="82" y1="61" x2="104" y2="61" />
      </g>
      <g strokeWidth={2.4}>
        <line x1="128" y1="60" x2="180" y2="46" stroke="#22d3ee" />
        <line x1="128" y1="60" x2="182" y2="60" stroke="#2563eb" />
        <line x1="128" y1="60" x2="180" y2="74" stroke="#7c3aed" />
      </g>
    </g>
  );
}

function Generic() {
  return (
    <g strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" className={body} stroke="currentColor">
      <rect x="40" y="44" width="100" height="34" rx="6" fill="hsl(var(--card))" />
      <rect x="30" y="52" width="12" height="18" rx="3" />
      <line x1="50" y1="52" x2="92" y2="52" opacity="0.5" />
      <g className={accent} stroke="currentColor">
        <line x1="140" y1="61" x2="176" y2="61" />
        <circle cx="178" cy="61" r="2.4" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}
