"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus, Trash2, ArrowRight } from "lucide-react";
import type { CompatByModel, CompatModule } from "@/lib/compat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ru = (n: number) => n.toLocaleString("ru-RU");
const price = (m: CompatModule) => m.pricePartner ?? m.priceBase;

export function CompatResult({ compat }: { compat: CompatByModel }) {
  const [kit, setKit] = useState<Record<string, CompatModule>>({});
  const items = Object.values(kit);
  const total = items.reduce((s, m) => s + price(m), 0);

  const toggle = (m: CompatModule) =>
    setKit((k) => {
      const next = { ...k };
      if (next[m.productId]) delete next[m.productId];
      else next[m.productId] = m;
      return next;
    });

  return (
    <div className="pb-24">
      <div className="mb-4">
        <div className="text-2xs uppercase tracking-wider text-muted-foreground">{compat.model.vendor} · {compat.model.series}</div>
        <h2 className="mono text-xl font-semibold">{compat.model.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Совместимые модули по порт-группам. Соберите комплект и запросите КП.</p>
      </div>

      <div className="space-y-6">
        {compat.portGroups.map((pg) => (
          <section key={pg.id} className="overflow-hidden rounded-lg border border-border">
            <header className="flex items-center justify-between border-b border-border bg-subtle px-4 py-2.5">
              <div className="font-medium">{pg.label}</div>
              <div className="mono text-2xs text-muted-foreground">{pg.count}× {pg.formFactor} · {pg.speed}</div>
            </header>

            {pg.modules.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">Нет подходящих модулей в каталоге.</div>
            ) : (
              <ul className="divide-y divide-border">
                {pg.modules.map((m) => {
                  const inKit = !!kit[m.productId];
                  return (
                    <li key={m.productId} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/product/${m.sku}`} className="mono text-sm font-medium text-primary hover:underline">{m.sku}</Link>
                          {m.role === "primary" ? (
                            <Badge className="bg-primary text-primary-foreground">Основной</Badge>
                          ) : (
                            <Badge variant="secondary">Альтернатива</Badge>
                          )}
                          {m.tested ? (
                            <span className="inline-flex items-center gap-1 text-2xs text-success"><Check className="h-3 w-3" /> протестировано</span>
                          ) : (
                            <span className="text-2xs text-muted-foreground">заявлено</span>
                          )}
                        </div>
                        <div className="mt-0.5 truncate text-sm text-muted-foreground">{m.name}</div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-2xs text-muted-foreground">
                          {m.minSoftwareVersion && <span className="mono">ПО ≥ {m.minSoftwareVersion}</span>}
                          {m.note && <span>{m.note}</span>}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="mono text-sm font-semibold">{ru(price(m))}&nbsp;₽</div>
                        <div className="text-2xs">
                          {m.stockStatus === "in" ? (
                            <span className="text-success">в наличии</span>
                          ) : (
                            <span className="text-warning">под заказ{m.leadTimeDays ? ` ${m.leadTimeDays} дн` : ""}</span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={inKit ? "secondary" : "default"}
                        onClick={() => toggle(m)}
                        className="shrink-0 gap-1"
                      >
                        {inKit ? <><Check className="h-3.5 w-3.5" /> в комплекте</> : <><Plus className="h-3.5 w-3.5" /> в комплект</>}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* липкий трей комплекта */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-6 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Комплект:</span>
              <span className="mono">{items.length} поз.</span>
              <span className="text-muted-foreground">·</span>
              <span className="mono font-semibold">{ru(total)}&nbsp;₽</span>
            </div>
            <button onClick={() => setKit({})} className="inline-flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground">
              <Trash2 className="h-3.5 w-3.5" /> очистить
            </button>
            <Button className="ml-auto gap-1.5">
              Добавить комплект в спецификацию <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
