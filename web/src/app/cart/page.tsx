"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, FileText, ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";

const ru = (n: number) => Math.round(n).toLocaleString("ru-RU");
// Тиры по объёму (SPEC §9.6)
const tierFactor = (qty: number) => (qty >= 50 ? 0.83 : qty >= 10 ? 0.91 : 1);
const tierLabel = (qty: number) => (qty >= 50 ? "50+ (−17%)" : qty >= 10 ? "10–49 (−9%)" : "1–9");
const PROMOS: Record<string, number> = { MODUL10: 0.1, PARTNER: 0.15 };

export default function CartPage() {
  const { cart, setQty, removeFromCart, clearCart } = useStore();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; pct: number } | null>(null);
  const [promoErr, setPromoErr] = useState("");

  const lines = cart.map((it) => {
    const unit = it.priceBase * tierFactor(it.qty);
    return { ...it, unit, lineTotal: unit * it.qty, oemTotal: (it.oemPrice ?? 0) * it.qty };
  });
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const promoDisc = promo ? subtotal * promo.pct : 0;
  const afterPromo = subtotal - promoDisc;
  const vat = afterPromo - afterPromo / 1.2; // НДС 20% в т.ч.
  const oemSum = lines.reduce((s, l) => s + l.oemTotal, 0);
  const savings = oemSum > 0 ? oemSum - afterPromo : 0;

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (PROMOS[code]) { setPromo({ code, pct: PROMOS[code] }); setPromoErr(""); }
    else { setPromo(null); setPromoErr("Промокод не найден"); }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <h1 className="mb-5 text-2xl font-semibold tracking-tight">Спецификация</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Спецификация пуста.</p>
            <Button asChild className="mt-4"><Link href="/catalog">Перейти в каталог</Link></Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* позиции */}
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-subtle text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Позиция</th>
                    <th className="px-4 py-2.5 text-center font-medium">Кол-во</th>
                    <th className="px-4 py-2.5 text-right font-medium">Цена/шт</th>
                    <th className="px-4 py-2.5 text-right font-medium">Сумма</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map((l) => (
                    <tr key={l.sku}>
                      <td className="px-4 py-3">
                        <Link href={`/product/${l.sku}`} className="mono text-sm font-medium text-primary hover:underline">{l.sku}</Link>
                        <div className="text-2xs text-muted-foreground">{l.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="mx-auto flex w-fit items-center gap-1 rounded-md border border-border">
                          <button onClick={() => setQty(l.sku, l.qty - 1)} className="flex h-7 w-7 items-center justify-center hover:bg-accent"><Minus className="h-3 w-3" /></button>
                          <input
                            value={l.qty}
                            onChange={(e) => setQty(l.sku, parseInt(e.target.value) || 1)}
                            className="mono h-7 w-10 bg-transparent text-center text-sm outline-none"
                          />
                          <button onClick={() => setQty(l.sku, l.qty + 1)} className="flex h-7 w-7 items-center justify-center hover:bg-accent"><Plus className="h-3 w-3" /></button>
                        </div>
                        <div className="mt-1 text-center text-2xs text-muted-foreground">{tierLabel(l.qty)}</div>
                      </td>
                      <td className="mono px-4 py-3 text-right tabular-nums">{ru(l.unit)} ₽</td>
                      <td className="mono px-4 py-3 text-right font-medium tabular-nums">{ru(l.lineTotal)} ₽</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeFromCart(l.sku)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end border-t border-border px-4 py-2">
                <button onClick={clearCart} className="text-2xs text-muted-foreground hover:text-foreground">Очистить спецификацию</button>
              </div>
            </div>

            {/* сводка */}
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Промокод (MODUL10 / PARTNER)"
                    className="mono h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button variant="outline" size="sm" className="h-9" onClick={applyPromo}>ОК</Button>
                </div>
                {promoErr && <p className="mt-1 text-2xs text-destructive">{promoErr}</p>}
                {promo && <p className="mt-1 text-2xs text-success">Промокод {promo.code}: −{promo.pct * 100}%</p>}
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
                {savings > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Экономия vs OEM</span><span className="mono">−{ru(savings)} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Сумма</span><span className="mono">{ru(subtotal)} ₽</span>
                </div>
                {promo && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Промокод {promo.code}</span><span className="mono">−{ru(promoDisc)} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>в т.ч. НДС 20%</span><span className="mono">{ru(vat)} ₽</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <span>Итого</span><span className="mono">{ru(afterPromo)} ₽</span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gap-1.5"><FileText className="h-4 w-4" /> Запросить КП</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Запрос отправлен</DialogTitle>
                    <DialogDescription>
                      Спецификация на {lines.length} поз. ({ru(afterPromo)} ₽) принята. Менеджер пришлёт КП в течение часа.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={clearCart}>Очистить и закрыть</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="w-full">Оформить заказ</Button>
              <p className="text-center text-2xs text-muted-foreground">Прикрепите ТЗ или BOM — подберём и согласуем КП.</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
