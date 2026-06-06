"use client";

import { useState } from "react";
import { Activity, Check, AlertTriangle, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

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

type Key = "temp" | "voltage" | "current" | "tx" | "rx";
type State = "norm" | "warn" | "alarm";
const TH: Record<Key, [number, number, number, number]> = {
  temp: [-5, 0, 70, 75], voltage: [2.97, 3.13, 3.46, 3.63], current: [2, 3, 11, 13], tx: [-8.2, -5.2, -1.0, 0.5], rx: [-14.4, -11.4, 0.5, 2.0],
};
const META: Record<Key, { label: string; unit: string }> = {
  temp: { label: "Температура", unit: "°C" }, voltage: { label: "Напряжение", unit: "В" }, current: { label: "Ток смещения", unit: "mA" }, tx: { label: "Tx Power", unit: "dBm" }, rx: { label: "Rx Power", unit: "dBm" },
};
const KEYS: Key[] = ["temp", "voltage", "current", "tx", "rx"];
const STATUS_RU: Record<State, string> = { norm: "норма", warn: "внимание", alarm: "авария" };

const CHIP: Record<State, string> = { norm: "border-success/30 bg-success-muted text-success", warn: "border-warning/30 bg-warning-muted text-warning", alarm: "border-destructive/30 bg-destructive-muted text-destructive" };
const DOT: Record<State, string> = { norm: "bg-success", warn: "bg-warning", alarm: "bg-destructive" };
const PILL: Record<State, string> = { norm: "bg-success-muted text-success", warn: "bg-warning-muted text-warning", alarm: "bg-destructive-muted text-destructive" };
const BANNER: Record<State, string> = { norm: "border-success/30 bg-success-muted", warn: "border-warning/30 bg-warning-muted", alarm: "border-destructive/30 bg-destructive-muted" };

function classify(key: Key, v: number): State {
  const [la, lw, hw, ha] = TH[key];
  if (v < la || v > ha) return "alarm";
  if (v < lw || v > hw) return "warn";
  return "norm";
}

type Port = { port: string; type: string; m: Partial<Record<Key, number>> };
function parse(text: string): Port[] {
  const ports: Port[] = [];
  let cur: Port | null = null;
  for (const line of text.split(/\r?\n/)) {
    const head = line.match(/^\s*((?:Te|Gi|Twe|Fo|Hu|Eth(?:ernet)?|xe-|ge-)[\w./-]*\d)\s*$/i);
    if (head) { cur = { port: head[1], type: "", m: {} }; ports.push(cur); continue; }
    if (!cur) continue;
    const tr = line.match(/Transceiver\s*:\s*(.+\S)/i); if (tr) cur.type = tr[1];
    const grab = (re: RegExp, key: Key) => { const m = line.match(re); if (m) cur!.m[key] = parseFloat(m[1]); };
    grab(/Temperature\s*:?\s*(-?\d+(?:\.\d+)?)/i, "temp");
    grab(/Voltage\s*:?\s*(-?\d+(?:\.\d+)?)/i, "voltage");
    grab(/Current\s*:?\s*(-?\d+(?:\.\d+)?)/i, "current");
    grab(/Tx\s*Power\s*:?\s*(-?\d+(?:\.\d+)?)/i, "tx");
    grab(/Rx\s*Power\s*:?\s*(-?\d+(?:\.\d+)?)/i, "rx");
  }
  return ports.filter((p) => Object.keys(p.m).length);
}

function worstOf(p: Port): State {
  const st = (Object.keys(p.m) as Key[]).map((k) => classify(k, p.m[k]!));
  return st.includes("alarm") ? "alarm" : st.includes("warn") ? "warn" : "norm";
}

export default function DomPage() {
  const [input, setInput] = useState("");
  const [ports, setPorts] = useState<Port[] | null>(null);

  const run = (text: string) => { setInput(text); setPorts(text.trim() ? parse(text) : null); };

  const flat = (ports ?? []).flatMap((p) => (Object.keys(p.m) as Key[]).map((k) => classify(k, p.m[k]!)));
  const alarms = (ports ?? []).filter((p) => worstOf(p) === "alarm");
  const warns = (ports ?? []).filter((p) => worstOf(p) === "warn");
  const overall: State = alarms.length ? "alarm" : warns.length ? "warn" : "norm";
  const verdictText =
    overall === "alarm" ? { t: `Авария на ${alarms.length} порт(ах)`, n: `Параметры за порогом alarm — нужна замена модуля или чистка трассы. Порты: ${alarms.map((p) => p.port).join(", ")}.` }
    : overall === "warn" ? { t: `Внимание: ${warns.length} порт(ов) у порога`, n: `Параметры в зоне warning — запас на исходе. Проверьте коннекторы и затухание. Порты: ${warns.map((p) => p.port).join(", ")}.` }
    : { t: "Все порты в норме", n: "Оптические параметры в пределах нормы с запасом. Действий не требуется." };
  const VIcon = overall === "norm" ? Check : overall === "warn" ? AlertTriangle : X;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <div className="mb-5 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">ИИ-диагностика DOM</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xs uppercase tracking-wide text-muted-foreground">Вывод <span className="mono">show interface transceiver</span></span>
              <div className="flex gap-2">
                <button onClick={() => run(SAMPLE)} className="text-2xs text-primary hover:underline">Пример</button>
                <button onClick={() => run("")} className="text-2xs text-muted-foreground hover:text-foreground">Очистить</button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => run(e.target.value)}
              placeholder="Вставьте вывод консоли…"
              className="mono h-[460px] w-full resize-none rounded-lg border border-border bg-[#0b0f17] p-4 text-2xs leading-relaxed text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button onClick={() => run(input)} className="mt-3 w-full">Разобрать</Button>
          </div>

          <div>
            {!ports ? (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
                Вставьте вывод и нажмите «Разобрать» — покажу разбор по портам и вердикт.
              </div>
            ) : ports.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-strong bg-subtle p-8 text-center">
                <p className="text-sm font-medium">Не удалось распознать параметры</p>
                <p className="mt-1 text-sm text-muted-foreground">Нужен вывод с полями Temperature / Voltage / Tx / Rx Power.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-xl border p-4 ${BANNER[overall]}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${DOT[overall]}`}><VIcon className="h-5 w-5" /></span>
                    <div>
                      <h3 className={`text-sm font-semibold ${overall === "norm" ? "text-success" : overall === "warn" ? "text-warning" : "text-destructive"}`}>{verdictText.t}</h3>
                      <p className="mt-0.5 text-xs text-foreground/80">{verdictText.n}</p>
                    </div>
                  </div>
                  <div className="mono mt-3 flex flex-wrap gap-2 text-2xs">
                    <span className="rounded border border-border bg-card px-2 py-1">портов: {ports.length}</span>
                    <span className="rounded border border-border bg-card px-2 py-1 text-success">норма: {flat.filter((s) => s === "norm").length}</span>
                    <span className="rounded border border-border bg-card px-2 py-1 text-warning">внимание: {flat.filter((s) => s === "warn").length}</span>
                    <span className="rounded border border-border bg-card px-2 py-1 text-destructive">авария: {flat.filter((s) => s === "alarm").length}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {ports.map((p) => {
                    const w = worstOf(p);
                    return (
                      <div key={p.port} className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                          <div className="flex items-center gap-2"><span className="mono text-sm font-semibold">{p.port}</span><span className="text-2xs text-muted-foreground">{p.type || "—"}</span></div>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-medium ${PILL[w]}`}><span className={`h-1.5 w-1.5 rounded-full ${DOT[w]}`} />{STATUS_RU[w]}</span>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                            {KEYS.filter((k) => k in p.m).map((k) => {
                              const st = classify(k, p.m[k]!);
                              return (
                                <div key={k} className={`rounded-lg border px-3 py-2 ${CHIP[st]}`}>
                                  <div className="flex items-center justify-between"><span className="text-2xs text-muted-foreground">{META[k].label}</span><span className={`h-1.5 w-1.5 rounded-full ${DOT[st]}`} /></div>
                                  <div className="mono tnum mt-0.5 text-base font-semibold">{p.m[k]} <span className="text-2xs font-normal text-muted-foreground">{META[k].unit}</span></div>
                                </div>
                              );
                            })}
                          </div>
                          {"rx" in p.m && (
                            <div className="mt-2">
                              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                                <div className="absolute inset-y-0 left-0 w-[13%] bg-destructive/40" />
                                <div className="absolute inset-y-0 left-[13%] w-[17%] bg-warning/40" />
                                <div className="absolute inset-y-0 left-[30%] right-0 bg-success/25" />
                                <div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: `${Math.max(0, Math.min(100, ((p.m.rx! + 16) / 18) * 100))}%` }} />
                              </div>
                              <div className="mt-1 text-2xs text-muted-foreground">Запас Rx по шкале −16…+2 dBm</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
