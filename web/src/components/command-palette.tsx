"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Box, GitCompare, ClipboardList, Calculator, ScanSearch, Activity, PiggyBank, FileSpreadsheet, Network, User, LayoutGrid } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Cmd = { label: string; href: string; icon: typeof Box; hint?: string };
const COMMANDS: Cmd[] = [
  { label: "Каталог", href: "/catalog", icon: LayoutGrid },
  { label: "Подбор совместимости", href: "/compatibility", icon: Network },
  { label: "Калькулятор оптбюджета", href: "/calculator", icon: Calculator },
  { label: "Декодер артикула", href: "/decoder", icon: ScanSearch },
  { label: "ИИ-диагностика DOM", href: "/dom", icon: Activity },
  { label: "Калькулятор экономии", href: "/economy", icon: PiggyBank },
  { label: "Быстрый заказ по Excel", href: "/order-excel", icon: FileSpreadsheet },
  { label: "Сравнение", href: "/compare", icon: GitCompare },
  { label: "Спецификация", href: "/cart", icon: ClipboardList },
  { label: "Личный кабинет", href: "/account", icon: User },
];

type Hit = { sku: string; name: string; priceBase: number; stockStatus: string };
const ru = (n: number) => n.toLocaleString("ru-RU");

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setHits([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const d = await r.json();
        setHits(d.items ?? []);
      } catch { setHits([]); }
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  const cmds = COMMANDS.filter((c) => c.label.toLowerCase().includes(q.trim().toLowerCase()));
  const go = (href: string) => { setOpen(false); setQ(""); router.push(href); };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ(""); }}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Командная палитра</DialogTitle>
        <DialogDescription className="sr-only">Поиск по артикулам и быстрые команды</DialogDescription>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { if (hits[0]) go(`/product/${hits[0].sku}`); else if (cmds[0]) go(cmds[0].href); } }}
            placeholder="Поиск по артикулу или команда…"
            className="mono h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="mono rounded border border-border bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground">esc</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {hits.length > 0 && (
            <div className="mb-1">
              <div className="px-2 py-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Товары</div>
              {hits.map((h) => (
                <button key={h.sku} onClick={() => go(`/product/${h.sku}`)} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <span className="mono text-primary">{h.sku}</span>
                  <span className="flex-1 truncate text-muted-foreground">{h.name}</span>
                  <span className="mono text-2xs">{ru(h.priceBase)} ₽</span>
                </button>
              ))}
            </div>
          )}

          {cmds.length > 0 && (
            <div>
              <div className="px-2 py-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Команды</div>
              {cmds.map((c) => (
                <button key={c.href} onClick={() => go(c.href)} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent">
                  <c.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {q.trim() && hits.length === 0 && cmds.length === 0 && (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">Ничего не найдено по «{q}».</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
