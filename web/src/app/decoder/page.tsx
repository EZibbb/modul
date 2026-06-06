"use client";

import { useState } from "react";
import { ScanSearch } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

type Tone = "primary" | "cyan" | "success" | "muted" | "fg";
type Seg = { label: string; value: string; tone: Tone; note: string };

const FF: Record<string, string> = {
  SFP: "SFP — 1G, один канал", "SFP+": "SFP+ — 10G, один канал", SFP28: "SFP28 — 25G, один канал",
  QSFP: "QSFP — 40G, 4 канала", "QSFP+": "QSFP+ — 40G, 4 канала", QSFP28: "QSFP28 — 100G, 4 канала",
  "QSFP-DD": "QSFP-DD — 400G, 8 каналов", OSFP: "OSFP — 400/800G, 8 каналов",
};
const SPEED: Record<string, string> = {
  "1G": "1 Гбит/с", "10G": "10.3125 Гбит/с", "25G": "25.78 Гбит/с", "40G": "41.25 Гбит/с (4×10G)",
  "100G": "103.125 Гбит/с (4×25G)", "200G": "200 Гбит/с", "400G": "400 Гбит/с (8×50G)",
};
const REACH: Record<string, { t: string; d: string }> = {
  SR: { t: "Short Reach", d: "многомод (MMF), 850 нм, до 300–400 м" },
  SR4: { t: "Short Reach ×4", d: "MMF, MPO-12, 4 канала, до 100 м" },
  LR: { t: "Long Reach", d: "одномод (SMF), 1310 нм, до 10 км" },
  LR4: { t: "Long Reach ×4", d: "SMF, CWDM4, 1295–1309 нм, до 10 км" },
  LRM: { t: "Long Reach Multimode", d: "MMF, 1310 нм, до 220 м" },
  DR: { t: "Datacenter Reach", d: "SMF параллельный, 1310 нм, до 500 м" },
  DR4: { t: "Datacenter Reach ×4", d: "SMF, MPO-12, 4 канала, до 500 м" },
  FR: { t: "Far Reach", d: "SMF, 1310 нм, до 2 км" },
  FR4: { t: "Far Reach ×4", d: "SMF, CWDM, 4 канала, до 2 км" },
  ER: { t: "Extended Reach", d: "SMF, 1550 нм, до 40 км" },
  ER4: { t: "Extended Reach ×4", d: "SMF, 4 канала, до 40 км" },
  ZR: { t: "Z Reach", d: "SMF, 1550 нм, до 80 км" },
  BX: { t: "BiDi", d: "одно волокно, разные λ Tx/Rx" },
  DAC: { t: "Direct Attach Copper", d: "медный кабель, пассивный, до 5 м" },
  AOC: { t: "Active Optical Cable", d: "активный оптический кабель" },
  T: { t: "Twisted pair", d: "медь RJ45, витая пара" },
  CWDM: { t: "CWDM", d: "грубое спектральное уплотнение, сетка 20 нм" },
  DWDM: { t: "DWDM", d: "плотное уплотнение, сетка ITU 50/100 ГГц" },
};
const SAMPLES = ["QSFP28-100G-LR4", "MC-SFP10G-LR", "SFP-25G-SR", "QSFP-DD-400G-DR4", "SFP+10G-BX-D", "DWDM-SFP10G-C34"];

const TONE: Record<Tone, string> = {
  primary: "border-primary/40 bg-primary-muted text-primary",
  cyan: "border-cyan/40 bg-cyan-muted text-cyan",
  success: "border-success/40 bg-success-muted text-success",
  muted: "border-border bg-muted text-muted-foreground",
  fg: "border-border bg-card text-foreground",
};

function decode(raw: string): Seg[] {
  const s = raw.toUpperCase().replace(/\s+/g, "");
  const out: Seg[] = [];
  let rest = s;
  if (/^MC-?/.test(rest)) { out.push({ label: "Префикс", value: "MC", tone: "muted", note: "Производитель — Modul comp" }); rest = rest.replace(/^MC-?/, ""); }
  const ff = rest.match(/^(QSFP-DD|QSFP28|QSFP\+|QSFP|SFP28|SFP\+|SFP|OSFP)/);
  if (ff) { out.push({ label: "Форм-фактор", value: ff[1], tone: "primary", note: FF[ff[1]] ?? "Тип корпуса модуля" }); rest = rest.slice(ff[1].length).replace(/^-/, ""); }
  const sp = rest.match(/(\d{1,3}G)/);
  if (sp) { out.push({ label: "Скорость", value: sp[1], tone: "cyan", note: SPEED[sp[1]] ?? "Скорость канала" }); rest = rest.replace(sp[1], "").replace(/^-/, "").replace(/-$/, ""); }
  const codes = Object.keys(REACH).sort((a, b) => b.length - a.length);
  for (const code of codes) {
    const m = rest.match(new RegExp(`(^|-)${code}(\\d?)(-|$)`));
    if (m) {
      const full = code + (m[2] || "");
      out.push({ label: "Тип/дальность", value: full, tone: "success", note: `${REACH[code].t} — ${REACH[code].d}` });
      rest = rest.replace(full, "").replace(/--/, "-").replace(/^-|-$/g, "");
      break;
    }
  }
  const bx = rest.match(/(^|-)(D|U)(-|$)/);
  if (bx) { out.push({ label: "Направление", value: bx[2], tone: "muted", note: bx[2] === "D" ? "Downstream — Tx 1330 / Rx 1270 нм" : "Upstream — Tx 1270 / Rx 1330 нм" }); rest = rest.replace(bx[0], "-").replace(/^-|-$/g, ""); }
  const ch = rest.match(/C(\d{2})/);
  if (ch) { out.push({ label: "Канал", value: "C" + ch[1], tone: "muted", note: "Номер спектрального канала по сетке ITU" }); rest = rest.replace(ch[0], "").replace(/^-|-$/g, ""); }
  if (rest && rest !== "-") out.push({ label: "Доп.", value: rest.replace(/^-|-$/g, ""), tone: "muted", note: "Дополнительный код производителя" });
  return out;
}

export default function DecoderPage() {
  const [input, setInput] = useState("QSFP28-100G-LR4");
  const segs = decode(input.trim());

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <div className="mb-5 flex items-center gap-2">
          <ScanSearch className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Декодер артикула</h1>
        </div>

        <div className="max-w-3xl space-y-4">
          <div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напр. QSFP28-100G-LR4"
              className="mono h-12 w-full rounded-lg border border-input bg-card px-4 text-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SAMPLES.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="mono rounded-md border border-border bg-card px-2 py-1 text-2xs text-muted-foreground hover:bg-accent">{s}</button>
              ))}
            </div>
          </div>

          {segs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">Введите артикул или название модуля.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                {segs.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={`rounded-lg border px-3 py-2 text-center ${TONE[s.tone]}`}>
                      <div className="text-2xs opacity-70">{s.label}</div>
                      <div className="mono text-base font-semibold">{s.value}</div>
                    </div>
                    {i < segs.length - 1 && <span className="text-border-strong">–</span>}
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-lg border border-border">
                {segs.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-border p-3.5 last:border-0">
                    <span className={`mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-2xs font-semibold ${TONE[s.tone]}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2"><span className="mono text-sm font-semibold">{s.value}</span><span className="text-2xs uppercase tracking-wide text-muted-foreground">{s.label}</span></div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
