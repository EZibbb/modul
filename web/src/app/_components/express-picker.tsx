"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { VendorCascade } from "@/lib/compat";
import { Button } from "@/components/ui/button";

type Summary = Record<string, { count: number; top: { sku: string; priceBase: number } | null }>;

const ru = (n: number) => n.toLocaleString("ru-RU");
const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "модуль" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "модуля" : "модулей");

export function ExpressPicker({ vendors, summary }: { vendors: VendorCascade; summary: Summary }) {
  const router = useRouter();
  const [vendorId, setVendorId] = useState(vendors[0]?.id ?? "");
  const vendor = vendors.find((v) => v.id === vendorId) ?? vendors[0];
  const [seriesId, setSeriesId] = useState(vendor?.series[0]?.id ?? "");
  const series = vendor?.series.find((s) => s.id === seriesId) ?? vendor?.series[0];
  const [modelId, setModelId] = useState(series?.models[0]?.id ?? "");

  const seriesList = vendor?.series ?? [];
  const models = useMemo(() => series?.models ?? [], [series]);
  const preview = summary[modelId];

  const onVendor = (id: string) => {
    setVendorId(id);
    const v = vendors.find((x) => x.id === id);
    const s = v?.series[0];
    setSeriesId(s?.id ?? "");
    setModelId(s?.models[0]?.id ?? "");
  };
  const onSeries = (id: string) => {
    setSeriesId(id);
    setModelId(vendor?.series.find((s) => s.id === id)?.models[0]?.id ?? "");
  };

  const selectCls = "glass-field h-11 w-full rounded-md px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const StepNum = ({ n, on }: { n: number; on?: boolean }) => (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-2xs font-semibold ${on ? "bg-cyan text-white" : "bg-primary text-primary-foreground"}`}>{n}</span>
  );

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Экспресс-подбор модуля</h3>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-2xs text-muted-foreground">3 шага</span>
      </div>
      <p className="mt-1 text-2xs text-muted-foreground">Вендор → серия оборудования → модель. Подберём совместимые трансиверы по портам.</p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 flex items-center gap-2 text-2xs text-muted-foreground"><StepNum n={1} /> Вендор оборудования</span>
          <select value={vendorId} onChange={(e) => onVendor(e.target.value)} className={selectCls}>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-2 text-2xs text-muted-foreground"><StepNum n={2} on /> Серия / платформа</span>
          <select value={seriesId} onChange={(e) => onSeries(e.target.value)} className={selectCls}>
            {seriesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-2 text-2xs text-muted-foreground"><StepNum n={3} /> Модель</span>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)} className={`mono ${selectCls}`}>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
      </div>

      {/* live-превью */}
      {preview && preview.top && (
        <div className="mt-4 rounded-xl border border-cyan/20 bg-cyan-muted/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-2xs text-muted-foreground">Совместимо · найдено</span>
            <span className="text-2xs font-semibold text-cyan">{preview.count} {plural(preview.count)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="mono flex items-center gap-1.5 text-sm font-medium text-primary">
              <Check className="h-3.5 w-3.5 text-success" /> {preview.top.sku}
              <span className="rounded bg-primary px-1.5 py-0.5 text-2xs text-primary-foreground">основной</span>
            </span>
            <span className="mono text-sm font-semibold">{ru(preview.top.priceBase)} ₽</span>
          </div>
        </div>
      )}

      <Button onClick={() => modelId && router.push(`/compatibility?model=${modelId}`)} className="mt-4 h-11 w-full gap-1.5">
        Подобрать совместимые модули <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-2xs text-muted-foreground">
        <Check className="h-3 w-3 text-success" /> Совместимость подтверждается тестом на конкретной платформе
      </p>
    </div>
  );
}
