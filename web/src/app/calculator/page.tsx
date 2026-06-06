"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

// Затухание волокна, dB/км (SPEC §9.4)
const ATTEN: Record<string, number> = { "850": 3.0, "1310": 0.35, "1550": 0.22 };
const CONN_LOSS = 0.5; // пара коннекторов
const SPLICE_LOSS = 0.1; // сварка

const Num = ({ label, value, onChange, step = 1, min = 0, suffix }: { label: string; value: number; onChange: (n: number) => void; step?: number; min?: number; suffix?: string }) => (
  <label className="block">
    <span className="mb-1 block text-2xs uppercase tracking-wide text-muted-foreground">{label}</span>
    <div className="flex items-center">
      <input
        type="number" value={value} step={step} min={min}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="mono h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {suffix && <span className="ml-2 text-sm text-muted-foreground">{suffix}</span>}
    </div>
  </label>
);

export default function CalculatorPage() {
  const [wl, setWl] = useState("1310");
  const [distance, setDistance] = useState(10);
  const [connectors, setConnectors] = useState(4);
  const [splices, setSplices] = useState(2);
  const [attenuator, setAttenuator] = useState(0);
  const [budget, setBudget] = useState(8.2);
  const [reserve, setReserve] = useState(3);

  const fiberLoss = distance * ATTEN[wl];
  const connLoss = connectors * CONN_LOSS;
  const spliceLoss = splices * SPLICE_LOSS;
  const totalLoss = fiberLoss + connLoss + spliceLoss + attenuator;
  const margin = budget - totalLoss - reserve;

  const verdict =
    totalLoss > budget
      ? { icon: "🔴", text: "Не хватает бюджета", cls: "border-destructive/40 bg-destructive-muted text-destructive", hint: "Потери превышают бюджет линка — нужен трансивер большей дальности или усилитель/меньше потерь." }
      : margin < 0
        ? { icon: "🟠", text: "Работает без запаса", cls: "border-warning/40 bg-warning-muted text-warning", hint: "Линк заведётся, но запас ниже требуемого резерва — на грани." }
        : { icon: "🟢", text: "Работоспособна", cls: "border-success/40 bg-success-muted text-success", hint: "Бюджета достаточно с требуемым запасом." };

  const breakdown = [
    { label: `Волокно ${distance} км × ${ATTEN[wl]} dB/км`, v: fiberLoss },
    { label: `Коннекторы ${connectors} × ${CONN_LOSS} dB`, v: connLoss },
    { label: `Сварки ${splices} × ${SPLICE_LOSS} dB`, v: spliceLoss },
    { label: "Аттенюатор", v: attenuator },
  ].filter((b) => b.v > 0);

  const lossPct = Math.min(100, (totalLoss / budget) * 100);
  const reservePct = Math.min(100, (reserve / budget) * 100);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <div className="mb-5 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Калькулятор оптического бюджета</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,420px)]">
          {/* конструктор линии */}
          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <label className="block">
              <span className="mb-1 block text-2xs uppercase tracking-wide text-muted-foreground">Длина волны</span>
              <select value={wl} onChange={(e) => setWl(e.target.value)} className="mono h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="850">850 нм (MMF, 3.0 dB/км)</option>
                <option value="1310">1310 нм (SMF, 0.35 dB/км)</option>
                <option value="1550">1550 нм (SMF, 0.22 dB/км)</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Num label="Длина линии" value={distance} onChange={setDistance} step={0.5} suffix="км" />
              <Num label="Бюджет трансивера" value={budget} onChange={setBudget} step={0.1} suffix="dB" />
              <Num label="Коннекторов (пар)" value={connectors} onChange={setConnectors} />
              <Num label="Сварок" value={splices} onChange={setSplices} />
              <Num label="Аттенюатор" value={attenuator} onChange={setAttenuator} step={0.5} suffix="dB" />
              <Num label="Требуемый резерв" value={reserve} onChange={setReserve} step={0.5} suffix="dB" />
            </div>
          </div>

          {/* результат */}
          <div className="space-y-4">
            <div className={`rounded-lg border p-4 ${verdict.cls}`}>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span>{verdict.icon}</span> {verdict.text}
              </div>
              <p className="mt-1 text-2xs opacity-90">{verdict.hint}</p>
              <div className="mono mt-3 flex items-baseline gap-2">
                <span className="text-2xs uppercase tracking-wide opacity-80">Запас</span>
                <span className="text-2xl font-semibold">{margin >= 0 ? "+" : ""}{margin.toFixed(2)} dB</span>
              </div>
            </div>

            {/* шкала потери / бюджет */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex justify-between text-2xs text-muted-foreground">
                <span>Потери: <span className="mono text-foreground">{totalLoss.toFixed(2)} dB</span></span>
                <span>Бюджет: <span className="mono text-foreground">{budget.toFixed(1)} dB</span></span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                <div className={`absolute inset-y-0 left-0 ${totalLoss > budget ? "bg-destructive" : margin < 0 ? "bg-warning" : "bg-success"}`} style={{ width: `${lossPct}%` }} />
                <div className="absolute inset-y-0 w-0.5 bg-foreground/60" style={{ left: `${100 - reservePct}%` }} title="Порог резерва" />
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {breakdown.map((b) => (
                  <div key={b.label} className="flex justify-between text-muted-foreground">
                    <span>{b.label}</span><span className="mono">{b.v.toFixed(2)} dB</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-1 font-medium">
                  <span>Суммарные потери</span><span className="mono">{totalLoss.toFixed(2)} dB</span>
                </div>
              </div>
            </div>

            <p className="text-center text-2xs text-muted-foreground">
              Модель: затухание волокна × длина + коннекторы (0.5 dB/пара) + сварки (0.1 dB) + аттенюатор. Запас = бюджет − потери − резерв.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
