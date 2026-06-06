"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Sparkles, ClipboardList, User, GitCompare, ChevronDown, Calculator, ScanSearch, Activity, PiggyBank, FileSpreadsheet } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/compatibility", label: "Совместимость" },
];

const TOOLS = [
  { href: "/calculator", label: "Калькулятор оптбюджета", icon: Calculator, desc: "Расчёт бюджета линии" },
  { href: "/decoder", label: "Декодер артикула", icon: ScanSearch, desc: "Разбор названия модуля" },
  { href: "/dom", label: "Диагностика DOM", icon: Activity, desc: "Разбор show transceiver" },
  { href: "/economy", label: "Калькулятор экономии", icon: PiggyBank, desc: "Сравнение с OEM" },
  { href: "/order-excel", label: "Заказ по Excel", icon: FileSpreadsheet, desc: "Список SKU → спецификация" },
];

export function SiteHeader({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { cartCount, compare } = useStore();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : "/catalog");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-4 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Modul<span className="font-normal text-muted-foreground">&nbsp;comp</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-2.5 py-1.5 hover:bg-accent hover:text-foreground">
              {n.label}
            </Link>
          ))}
          {/* Инструменты — выпадающее меню */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 hover:bg-accent hover:text-foreground ${toolsOpen ? "bg-accent text-foreground" : ""}`}
            >
              Инструменты <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
            </button>
            {toolsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setToolsOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                  {TOOLS.map((t) => (
                    <Link
                      key={t.href}
                      href={t.href}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent"
                    >
                      <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        <span className="block font-medium text-foreground">{t.label}</span>
                        <span className="block text-2xs text-muted-foreground">{t.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        <form onSubmit={submit} className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Артикул, модель, параметр…"
            className="mono h-9 w-full rounded-md border border-input bg-card pl-8 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <kbd className="mono pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground md:block">⌘K</kbd>
        </form>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="hidden gap-1.5 lg:inline-flex">
            <Sparkles className="h-4 w-4" /> ИИ-консультант
          </Button>
          <Link href="/compare" className="relative hidden h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-accent sm:inline-flex">
            <GitCompare className="h-4 w-4" /> Сравнение
            {compare.length > 0 && <span className="mono rounded bg-muted px-1.5 text-2xs text-muted-foreground">{compare.length}</span>}
          </Link>
          <Link href="/cart" className="relative inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
            <ClipboardList className="h-4 w-4" /> <span className="hidden sm:inline">Спецификация</span>
            {cartCount > 0 && <span className="mono rounded bg-primary-foreground/20 px-1.5 text-2xs">{cartCount}</span>}
          </Link>
          <Button asChild variant="outline" size="icon" aria-label="Личный кабинет">
            <Link href="/account"><User className="h-4 w-4" /></Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
