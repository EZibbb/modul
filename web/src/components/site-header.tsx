"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Sparkles, ClipboardList, User, GitCompare } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/compatibility", label: "Совместимость" },
  { href: "/calculator", label: "Калькулятор" },
];

export function SiteHeader({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

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
          <button className="relative hidden h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-accent sm:inline-flex">
            <GitCompare className="h-4 w-4" /> Сравнение
            <span className="mono rounded bg-muted px-1.5 text-2xs text-muted-foreground">2</span>
          </button>
          <button className="relative inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
            <ClipboardList className="h-4 w-4" /> <span className="hidden sm:inline">Спецификация</span>
            <span className="mono rounded bg-primary-foreground/20 px-1.5 text-2xs">5</span>
          </button>
          <Button asChild variant="outline" size="icon" aria-label="Личный кабинет">
            <Link href="/account"><User className="h-4 w-4" /></Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
