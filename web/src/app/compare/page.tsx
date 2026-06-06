"use client";

import { useState } from "react";
import Link from "next/link";
import { X, GitCompare, Plus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useStore, type CompareItem } from "@/lib/store";
import { AddToSpec } from "@/components/add-to-spec";
import { TEMP_LABELS } from "@/lib/catalog-params";

const ru = (n: number) => n.toLocaleString("ru-RU");
const reach = (m: number | null) => (m == null ? "—" : m >= 1000 ? `${m / 1000} км` : `${m} м`);

type Row = { label: string; get: (i: CompareItem) => string };
const ROWS: Row[] = [
  { label: "Форм-фактор", get: (i) => i.formFactor },
  { label: "Скорость", get: (i) => (i.speedGbps ? `${i.speedGbps}G` : "—") },
  { label: "Стандарт / тип", get: (i) => i.mediaType ?? "—" },
  { label: "Длина волны", get: (i) => (i.wavelengthNm ? `${i.wavelengthNm} нм` : "—") },
  { label: "Дальность", get: (i) => reach(i.reachM) },
  { label: "Разъём", get: (i) => i.connector ?? "—" },
  { label: "Темп. диапазон", get: (i) => (i.tempRange ? (TEMP_LABELS[i.tempRange] ?? i.tempRange) : "—") },
  { label: "DOM/DDM", get: (i) => (i.domSupport ? "Да" : "Нет") },
  { label: "Цена", get: (i) => `${ru(i.priceBase)} ₽` },
  { label: "vs OEM", get: (i) => (i.oemPrice ? `−${Math.round(((i.oemPrice - i.priceBase) / i.oemPrice) * 100)}%` : "—") },
];

export default function ComparePage() {
  const { compare, removeFromCompare, clearCompare } = useStore();
  const [onlyDiff, setOnlyDiff] = useState(false);

  const isDiff = (r: Row) => new Set(compare.map((i) => r.get(i))).size > 1;
  const rows = onlyDiff ? ROWS.filter(isDiff) : ROWS;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Сравнение модулей</h1>
          {compare.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                Только различия
              </label>
              <button onClick={clearCompare} className="text-2xs text-muted-foreground underline hover:text-foreground">Очистить</button>
            </div>
          )}
        </div>

        {compare.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
            <GitCompare className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Нет модулей для сравнения. Добавьте до 4 из каталога (иконка сравнения на карточке).</p>
            <Button asChild className="mt-4"><Link href="/catalog">Перейти в каталог</Link></Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-40 bg-subtle px-4 py-3 text-left text-xs font-medium text-muted-foreground">Параметр</th>
                  {compare.map((i) => (
                    <th key={i.sku} className="min-w-[180px] border-l border-border px-4 py-3 text-left align-top">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/product/${i.sku}`} className="mono text-sm font-medium text-primary hover:underline">{i.sku}</Link>
                        <button onClick={() => removeFromCompare(i.sku)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="mt-1 text-2xs font-normal text-muted-foreground">{i.name}</div>
                    </th>
                  ))}
                  {compare.length < 4 && (
                    <th className="min-w-[160px] border-l border-border px-4 py-3 text-left align-top">
                      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><Plus className="h-4 w-4" /> Добавить</Link>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => {
                  const diff = isDiff(r);
                  return (
                    <tr key={r.label} className={diff ? "bg-warning-muted/40" : ""}>
                      <td className="bg-subtle px-4 py-2.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          {diff && <span className="h-1.5 w-1.5 rounded-full bg-warning" />}
                          {r.label}
                        </span>
                      </td>
                      {compare.map((i) => (
                        <td key={i.sku} className="mono border-l border-border px-4 py-2.5">{r.get(i)}</td>
                      ))}
                      {compare.length < 4 && <td className="border-l border-border" />}
                    </tr>
                  );
                })}
                <tr>
                  <td className="bg-subtle px-4 py-3" />
                  {compare.map((i) => (
                    <td key={i.sku} className="border-l border-border px-4 py-3">
                      <AddToSpec item={{ sku: i.sku, name: i.name, priceBase: i.priceBase, pricePartner: null, oemPrice: i.oemPrice }} label="В спецификацию" />
                    </td>
                  ))}
                  {compare.length < 4 && <td className="border-l border-border" />}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
