"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Send, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToSpec } from "@/components/add-to-spec";
import { useStore } from "@/lib/store";

type AiProduct = { sku: string; name: string; formFactor: string; mediaType: string | null; reachM: number | null; wavelengthNm: number | null; connector: string | null; priceBase: number; pricePartner: number | null; oemPrice: number | null };
type Cta = { label: string; href: string };
type Msg = { role: "user" | "ai"; text: string; products?: AiProduct[]; suggestions?: string[]; cta?: Cta; pending?: boolean };

const GREETING: Msg = {
  role: "ai",
  text: "Я инженерный со-пилот Modul comp. Помогу подобрать модули под задачу, найти аналог OEM или разобрать DOM. Опишите задачу — например, «соединить два ЦОД, 80 км, 100G».",
  suggestions: ["Соединить два ЦОД, 80 км, 100G", "Аналог Cisco SFP-10G-LR", "Модули 25G для leaf-коммутатора", "Разобрать вывод DOM"],
};

const ru = (n: number) => n.toLocaleString("ru-RU");
const reach = (m: number | null) => (m == null ? null : m >= 1000 ? `${m / 1000} км` : `${m} м`);

function ProductMini({ p }: { p: AiProduct }) {
  const specs = [p.wavelengthNm ? `${p.wavelengthNm} нм` : null, reach(p.reachM), p.connector].filter(Boolean);
  const sav = p.oemPrice ? Math.round(((p.oemPrice - p.priceBase) / p.oemPrice) * 100) : null;
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <Link href={`/product/${p.sku}`} className="mono text-sm font-medium text-primary hover:underline">{p.sku}</Link>
        <Badge className="gap-1 bg-primary text-primary-foreground"><Sparkles className="h-3 w-3" /> подобрано ИИ</Badge>
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{p.name}</div>
      {specs.length > 0 && <div className="mono mt-1 text-2xs text-muted-foreground">{specs.join(" · ")}</div>}
      <div className="mt-2 flex items-center justify-between">
        <div>
          <span className="mono text-sm font-semibold">{ru(p.priceBase)} ₽</span>
          {sav != null && sav > 0 && <span className="ml-1.5 text-2xs text-success">−{sav}% к OEM</span>}
        </div>
        <AddToSpec item={{ sku: p.sku, name: p.name, priceBase: p.priceBase, pricePartner: p.pricePartner, oemPrice: p.oemPrice }} size="sm" variant="outline" label="В спец." />
      </div>
    </div>
  );
}

export function AiCopilot() {
  const { aiOpen, aiSeed, closeAi } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const seedRef = useRef<string | null>(null);
  const loaded = useRef(false);

  async function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "ai", text: "", pending: true }]);
    try {
      const r = await fetch("/api/ai-demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) });
      const d = await r.json();
      setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "ai", text: d.text, products: d.products, suggestions: d.suggestions, cta: d.cta }; return c; });
    } catch {
      setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "ai", text: "Не удалось получить ответ. Попробуйте ещё раз." }; return c; });
    }
  }

  // загрузка истории (переживает закрытие drawer и перезагрузку вкладки)
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("modul-ai");
      if (s) setMsgs(JSON.parse(s));
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (loaded.current) {
      try { sessionStorage.setItem("modul-ai", JSON.stringify(msgs)); } catch {}
    }
  }, [msgs]);

  // при открытии: новый seed → отправить один раз; иначе показать приветствие только если пусто (историю НЕ трогаем)
  useEffect(() => {
    if (!aiOpen) return;
    if (aiSeed && aiSeed !== seedRef.current) {
      seedRef.current = aiSeed;
      send(aiSeed);
      return;
    }
    setMsgs((m) => (m.length === 0 ? [GREETING] : m));
  }, [aiOpen, aiSeed]);

  function clearChat() {
    setMsgs([GREETING]);
    seedRef.current = null;
  }

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs]);

  return (
    <Sheet open={aiOpen} onOpenChange={(o) => { if (!o) closeAi(); }}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <div className="flex items-center justify-between gap-2 pr-6">
            <SheetTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span> ИИ-со-пилот</SheetTitle>
            {msgs.length > 1 && <button onClick={clearChat} className="text-2xs text-muted-foreground hover:text-foreground">Очистить</button>}
          </div>
          <SheetDescription>Подбор модулей, аналоги OEM, разбор DOM — на данных каталога.</SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">{m.text}</div>
              ) : m.pending ? (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-200ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-100ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm leading-relaxed [&>*+*]:mt-2 [&_strong]:font-semibold [&_ul]:ml-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:ml-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mt-0.5 [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1 [&_code]:text-2xs [&_table]:my-1 [&_table]:w-full [&_table]:border-collapse [&_th]:border-b [&_th]:border-border [&_th]:py-1 [&_th]:text-left [&_th]:font-medium [&_td]:border-b [&_td]:border-border/40 [&_td]:py-1 [&_td]:pr-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                  </div>
                  {m.products?.map((p) => <ProductMini key={p.sku} p={p} />)}
                  {m.cta && (
                    <Button asChild variant="outline" size="sm" className="gap-1.5"><Link href={m.cta.href} onClick={closeAi}>{m.cta.label} <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
                  )}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestions.map((s) => (
                        <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-card px-2.5 py-1 text-2xs text-muted-foreground hover:bg-accent hover:text-foreground">{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Опишите задачу…"
            className="h-10 flex-1 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" aria-label="Отправить"><Send className="h-4 w-4" /></Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
