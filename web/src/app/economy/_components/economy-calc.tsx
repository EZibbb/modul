"use client";

import { useState } from "react";
import { AddToSpec } from "@/components/add-to-spec";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type P = { sku: string; name: string; priceBase: number; pricePartner: number | null; oemPrice: number; oemRef: string | null };
const ru = (n: number) => Math.round(n).toLocaleString("ru-RU");

export function EconomyCalc({ products }: { products: P[] }) {
  const [sku, setSku] = useState(products[0]?.sku ?? "");
  const [qty, setQty] = useState(10);
  const p = products.find((x) => x.sku === sku) ?? products[0];
  if (!p) return null;

  const our = p.pricePartner ?? p.priceBase;
  const savePer = p.oemPrice - our;
  const savePct = Math.round((savePer / p.oemPrice) * 100);
  const ourBatch = our * qty;
  const oemBatch = p.oemPrice * qty;
  const saveBatch = oemBatch - ourBatch;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,440px)]">
      {/* выбор */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <label className="block">
          <span className="mb-1 block text-2xs uppercase tracking-wide text-muted-foreground">Модуль Modul comp</span>
          <Select value={sku} onValueChange={setSku}>
            <SelectTrigger className="mono h-10 w-full bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {products.map((x) => <SelectItem key={x.sku} value={x.sku} className="mono">{x.sku} — {x.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className="block">
          <span className="mb-1 block text-2xs uppercase tracking-wide text-muted-foreground">Количество (партия)</span>
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="mono h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </label>

        <div className="rounded-lg border border-border bg-subtle p-4 text-sm">
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Аналог OEM</span><span className="mono">{p.oemRef ?? "—"}</span></div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div><div className="text-2xs text-muted-foreground">Наша цена</div><div className="mono text-lg font-semibold text-primary">{ru(our)} ₽</div></div>
            <div><div className="text-2xs text-muted-foreground">Цена OEM</div><div className="mono text-lg font-semibold text-muted-foreground line-through">{ru(p.oemPrice)} ₽</div></div>
          </div>
        </div>

        <AddToSpec item={{ sku: p.sku, name: p.name, priceBase: p.priceBase, pricePartner: p.pricePartner, oemPrice: p.oemPrice }} qty={qty} label={`Добавить ${qty} шт в спецификацию`} className="w-full" />
      </div>

      {/* результат */}
      <div className="space-y-4">
        <div className="rounded-xl border border-success/30 bg-success-muted p-5 text-center">
          <div className="text-2xs uppercase tracking-wide text-success/80">Экономия на партии {qty} шт</div>
          <div className="mono mt-1 text-4xl font-bold text-success">{ru(saveBatch)} ₽</div>
          <div className="mt-1 text-sm text-success/80">−{savePct}% к OEM · экономия {ru(savePer)} ₽/шт</div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr><td className="px-4 py-2.5 text-muted-foreground">Наша цена × {qty}</td><td className="mono px-4 py-2.5 text-right font-medium">{ru(ourBatch)} ₽</td></tr>
              <tr><td className="px-4 py-2.5 text-muted-foreground">OEM × {qty}</td><td className="mono px-4 py-2.5 text-right text-muted-foreground line-through">{ru(oemBatch)} ₽</td></tr>
              <tr className="bg-success-muted/40"><td className="px-4 py-2.5 font-semibold text-success">Экономия</td><td className="mono px-4 py-2.5 text-right font-semibold text-success">−{ru(saveBatch)} ₽</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-center text-2xs text-muted-foreground">Цены OEM — ориентировочные прайс-листы вендоров. Экономия при идентичных тех-характеристиках и тесте на оборудовании.</p>
      </div>
    </div>
  );
}
