"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { CatalogSort } from "@/lib/catalog";
import { FACET_PARAM, SORT_LABELS, TEMP_LABELS, toggleCsv } from "@/lib/catalog-params";

const TEMP_SHORT: Record<string, string> = { com: "0…+70 °C", ext: "−20…+85 °C", ind: "−40…+85 °C" };

const chipLabel = (param: string, v: string) => {
  switch (param) {
    case "speed": return `${v}G`;
    case "wl": return `${v} нм`;
    case "temp": return TEMP_SHORT[v] ?? TEMP_LABELS[v] ?? v;
    default: return v;
  }
};

export function CatalogToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const push = (params: URLSearchParams) => router.push(params.toString() ? `${pathname}?${params}` : pathname);

  function setSort(sort: string) {
    const next = new URLSearchParams(sp.toString());
    if (sort === "popular") next.delete("sort");
    else next.set("sort", sort);
    next.delete("page");
    push(next);
  }

  function removeCsv(param: string, v: string) {
    push(toggleCsv(new URLSearchParams(sp.toString()), param, v));
  }
  function removeKey(key: string) {
    const next = new URLSearchParams(sp.toString());
    next.delete(key);
    next.delete("page");
    push(next);
  }

  // активные чипы
  const chips: { label: string; onRemove: () => void }[] = [];
  if (sp.get("q")) chips.push({ label: `«${sp.get("q")}»`, onRemove: () => removeKey("q") });
  for (const param of Object.values(FACET_PARAM)) {
    for (const v of sp.get(param)?.split(",").filter(Boolean) ?? []) {
      chips.push({ label: chipLabel(param, v), onRemove: () => removeCsv(param, v) });
    }
  }
  if (sp.get("stock") === "1") chips.push({ label: "В наличии", onRemove: () => removeKey("stock") });
  if (sp.get("dom") === "1") chips.push({ label: "DOM", onRemove: () => removeKey("dom") });

  const sort = (sp.get("sort") as CatalogSort) ?? "popular";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Найдено: <span className="mono font-medium text-foreground">{total}</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Сортировка
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {(Object.keys(SORT_LABELS) as CatalogSort[]).map((s) => (
              <option key={s} value={s}>{SORT_LABELS[s]}</option>
            ))}
          </select>
        </label>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c, i) => (
            <button
              key={i}
              onClick={c.onRemove}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-2xs font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {c.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button onClick={() => router.push(pathname)} className="text-2xs text-muted-foreground underline hover:text-foreground">
            Сбросить всё
          </button>
        </div>
      )}
    </div>
  );
}
