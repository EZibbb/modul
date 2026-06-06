"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Server } from "lucide-react";
import type { VendorCascade } from "@/lib/compat";

export function CompatCascade({
  vendors,
  currentModelId,
}: {
  vendors: VendorCascade;
  currentModelId?: string;
}) {
  // вендор, которому принадлежит выбранная модель (или первый)
  const ownerVendor = vendors.find((v) =>
    v.series.some((s) => s.models.some((m) => m.id === currentModelId)),
  );
  const [vendorId, setVendorId] = useState(ownerVendor?.id ?? vendors[0]?.id);
  const vendor = vendors.find((v) => v.id === vendorId) ?? vendors[0];

  return (
    <div className="text-sm">
      <div className="mb-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Вендор оборудования</div>
      <div className="flex flex-wrap gap-1.5">
        {vendors.map((v) => (
          <button
            key={v.id}
            onClick={() => setVendorId(v.id)}
            className={`rounded-md border px-2.5 py-1.5 text-sm ${
              v.id === vendorId ? "border-primary bg-primary-muted text-primary" : "border-border bg-card hover:bg-accent"
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>

      <div className="mb-2 mt-5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Модель</div>
      <div className="space-y-3">
        {vendor?.series.map((s) => (
          <div key={s.id}>
            <div className="px-1 text-2xs font-medium uppercase tracking-wide text-muted-foreground">{s.name}</div>
            <ul className="mt-1 space-y-0.5">
              {s.models.map((m) => {
                const active = m.id === currentModelId;
                return (
                  <li key={m.id}>
                    <Link
                      href={`/compatibility?model=${m.id}`}
                      className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 ${
                        active ? "border-primary bg-primary-muted text-primary" : "border-border bg-card hover:bg-accent"
                      }`}
                    >
                      <span className="mono flex items-center gap-2">
                        <Server className="h-3.5 w-3.5 opacity-60" />
                        {m.name}
                      </span>
                      <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                        {m.portGroupCount} порт-групп
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
