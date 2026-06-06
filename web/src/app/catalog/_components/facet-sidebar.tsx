"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import type { Facets, Facet } from "@/lib/catalog";
import type { CategoryNode } from "@/lib/catalog";
import { FACET_PARAM, toggleCsv } from "@/lib/catalog-params";

type Props = {
  facets: Facets;
  tree: CategoryNode[];
  currentCategory?: string;
};

export function FacetSidebar({ facets, tree, currentCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const selected = (key: string) => sp.get(key)?.split(",").filter(Boolean) ?? [];

  function toggle(paramKey: string, value: string) {
    const next = toggleCsv(new URLSearchParams(sp.toString()), paramKey, value);
    router.push(next.toString() ? `${pathname}?${next}` : pathname);
  }

  function setFlag(key: string, on: boolean) {
    const next = new URLSearchParams(sp.toString());
    if (on) next.set(key, "1");
    else next.delete(key);
    next.delete("page");
    router.push(next.toString() ? `${pathname}?${next}` : pathname);
  }

  const group = (title: string, paramKey: string, items: Facet[]) => {
    if (!items.length) return null;
    const sel = selected(paramKey);
    return (
      <div className="border-t border-border py-4">
        <div className="mb-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        <ul className="space-y-0.5">
          {items.map((it) => {
            const v = String(it.value);
            const on = sel.includes(v);
            return (
              <li key={v}>
                <button
                  onClick={() => toggle(paramKey, v)}
                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${on ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                    {on && <Check className="h-3 w-3" />}
                  </span>
                  <span className="flex-1 truncate">{it.label}</span>
                  <span className="mono text-2xs text-muted-foreground">{it.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const domOn = sp.get("dom") === "1";
  const stockOn = sp.get("stock") === "1";

  return (
    <aside className="text-sm">
      {/* категории */}
      <div className="pb-4">
        <div className="mb-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Категории</div>
        <ul className="space-y-0.5">
          <li>
            <Link href="/catalog" className={`block rounded-md px-1.5 py-1 hover:bg-accent ${!currentCategory ? "font-medium text-primary" : ""}`}>
              Все товары
            </Link>
          </li>
          {tree.map((c) => (
            <li key={c.id}>
              {c.children.length ? (
                <>
                  <div className="px-1.5 py-1 text-2xs font-medium uppercase tracking-wide text-muted-foreground">{c.name}</div>
                  <ul className="space-y-0.5">
                    {c.children.map((ch) => (
                      <li key={ch.id}>
                        <Link
                          href={`/catalog?cat=${ch.slug}`}
                          className={`flex items-center justify-between rounded-md px-1.5 py-1 pl-3 hover:bg-accent ${currentCategory === ch.slug ? "font-medium text-primary" : ""}`}
                        >
                          <span>{ch.name}</span>
                          <span className="mono text-2xs text-muted-foreground">{ch.productCount}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link
                  href={`/catalog?cat=${c.slug}`}
                  className={`flex items-center justify-between rounded-md px-1.5 py-1 hover:bg-accent ${currentCategory === c.slug ? "font-medium text-primary" : ""}`}
                >
                  <span>{c.name}</span>
                  <span className="mono text-2xs text-muted-foreground">{c.productCount}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* наличие / DOM */}
      <div className="border-t border-border py-4">
        <button onClick={() => setFlag("stock", !stockOn)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-accent">
          <span className={`flex h-4 w-4 items-center justify-center rounded border ${stockOn ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
            {stockOn && <Check className="h-3 w-3" />}
          </span>
          <span className="flex-1">Только в наличии</span>
        </button>
        <button onClick={() => setFlag("dom", !domOn)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-accent">
          <span className={`flex h-4 w-4 items-center justify-center rounded border ${domOn ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
            {domOn && <Check className="h-3 w-3" />}
          </span>
          <span className="flex-1">С поддержкой DOM</span>
          <span className="mono text-2xs text-muted-foreground">{facets.domSupport.yes}</span>
        </button>
      </div>

      {group("Скорость", FACET_PARAM.speedGbps, facets.speedGbps)}
      {group("Тип среды / стандарт", FACET_PARAM.mediaType, facets.mediaType)}
      {group("Разъём", FACET_PARAM.connector, facets.connector)}
      {group("Длина волны", FACET_PARAM.wavelengthNm, facets.wavelengthNm)}
      {group("Температурный диапазон", FACET_PARAM.tempRange, facets.tempRange)}
    </aside>
  );
}
