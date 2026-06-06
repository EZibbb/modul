"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

type P = { sku: string; name: string; priceBase: number; pricePartner: number | null; oemPrice: number | null };
const SAMPLE = `MC-SFP10G-LR  24
MC-QSFP100G-LR4;6
MC-SFP25G-LR, 16
MC-SFP-10G-LRX 4`;

type Row = { raw: string; qty: number; match: P | null; suggest: P | null };

function closest(input: string, products: P[]): P | null {
  const q = input.toUpperCase();
  let best: P | null = null;
  let bestScore = 0;
  for (const p of products) {
    const s = p.sku.toUpperCase();
    let score = 0;
    if (s.includes(q) || q.includes(s)) score = 50;
    let i = 0;
    while (i < Math.min(s.length, q.length) && s[i] === q[i]) i++;
    score += i; // общий префикс
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return bestScore >= 6 ? best : null;
}

export function BomImport({ products }: { products: P[] }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);

  const bySku = new Map(products.map((p) => [p.sku.toUpperCase(), p]));

  function check() {
    const parsed: Row[] = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
      const m = line.match(/^(.+?)[\s,;]+(\d+)\s*$/);
      const skuRaw = (m ? m[1] : line).trim();
      const qty = m ? parseInt(m[2]) : 1;
      const match = bySku.get(skuRaw.toUpperCase()) ?? null;
      return { raw: skuRaw, qty, match, suggest: match ? null : closest(skuRaw, products) };
    });
    setRows(parsed);
  }

  const recognized = rows?.filter((r) => r.match) ?? [];
  function addAll() {
    recognized.forEach((r) => addToCart({ sku: r.match!.sku, name: r.match!.name, priceBase: r.match!.priceBase, pricePartner: r.match!.pricePartner, oemPrice: r.match!.oemPrice }, r.qty));
    router.push("/cart");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xs uppercase tracking-wide text-muted-foreground">Вставьте список: артикул и количество в строке</span>
          <button onClick={() => setText(SAMPLE)} className="text-2xs text-primary hover:underline">Пример</button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"MC-SFP10G-LR  24\nMC-QSFP100G-LR4;6"}
          className="mono h-72 w-full resize-none rounded-lg border border-border bg-card p-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="mt-1 text-2xs text-muted-foreground">Разделители: пробел, запятая, точка с запятой или таб (как при вставке из Excel).</p>
        <Button onClick={check} className="mt-3 w-full">Проверить артикулы</Button>
      </div>

      <div>
        {!rows ? (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
            Вставьте список и нажмите «Проверить» — сверим со складом.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-subtle text-left text-xs text-muted-foreground">
                  <tr><th className="px-3 py-2 font-medium">Из списка</th><th className="px-3 py-2 text-center font-medium">Кол-во</th><th className="px-3 py-2 font-medium">Результат</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td className="mono px-3 py-2">{r.raw}</td>
                      <td className="mono px-3 py-2 text-center">{r.qty}</td>
                      <td className="px-3 py-2">
                        {r.match ? (
                          <span className="inline-flex items-center gap-1.5 text-success"><Check className="h-3.5 w-3.5" /> {r.match.sku}</span>
                        ) : r.suggest ? (
                          <span className="inline-flex items-center gap-1.5 text-warning"><AlertTriangle className="h-3.5 w-3.5" /> не найден · возможно <span className="mono">{r.suggest.sku}</span>?</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-destructive"><AlertTriangle className="h-3.5 w-3.5" /> не распознан</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Распознано <span className="mono font-medium text-foreground">{recognized.length}</span> из {rows.length}</span>
              <Button onClick={addAll} disabled={recognized.length === 0} className="gap-1.5">
                Добавить в спецификацию <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
