"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { VendorCascade } from "@/lib/compat";
import { Button } from "@/components/ui/button";

export function ExpressPicker({ vendors }: { vendors: VendorCascade }) {
  const router = useRouter();
  const [vendorId, setVendorId] = useState(vendors[0]?.id ?? "");
  const models = useMemo(() => {
    const v = vendors.find((x) => x.id === vendorId);
    return v ? v.series.flatMap((s) => s.models.map((m) => ({ ...m, series: s.name }))) : [];
  }, [vendors, vendorId]);
  const [modelId, setModelId] = useState(models[0]?.id ?? "");

  const selectCls =
    "glass-field h-10 w-full rounded-md px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="glass rounded-xl p-5">
      <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Экспресс-подбор совместимости</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-2xs text-muted-foreground">Вендор</span>
          <select
            value={vendorId}
            onChange={(e) => {
              setVendorId(e.target.value);
              const v = vendors.find((x) => x.id === e.target.value);
              setModelId(v?.series.flatMap((s) => s.models)[0]?.id ?? "");
            }}
            className={selectCls}
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-2xs text-muted-foreground">Модель</span>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)} className={`mono ${selectCls}`}>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button
            onClick={() => modelId && router.push(`/compatibility?model=${modelId}`)}
            className="h-10 w-full gap-1.5 sm:w-auto"
          >
            Подобрать <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mt-2 text-2xs text-muted-foreground">Модули, протестированные на вашем оборудовании, с экономией к OEM.</p>
    </div>
  );
}
