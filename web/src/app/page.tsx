import Link from "next/link";
import { Truck, ShieldCheck, FlaskConical, FileText, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopilotButton } from "@/components/copilot-button";
import { ExpressPicker } from "./_components/express-picker";
import { CategoryGlyph } from "@/components/module-art";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryTree, listProducts } from "@/lib/catalog";
import { getVendorsCascade, getCompatSummaryByModel } from "@/lib/compat";

const ru = (n: number) => n.toLocaleString("ru-RU");
const STOCK = "8 600+"; // презентационный объём склада (каталог-демо — срез)

const WL = [
  { wl: 850, label: "MULTIMODE" },
  { wl: 1310, label: "SINGLEMODE" },
  { wl: 1550, label: "LONG-HAUL" },
];

const CAT_NAV: [string, string][] = [
  ["Весь каталог", "/catalog"],
  ["SFP / SFP+", "/catalog?cat=sfp-plus"],
  ["SFP28", "/catalog?cat=sfp28"],
  ["QSFP+", "/catalog?cat=qsfp-plus"],
  ["QSFP28", "/catalog?cat=qsfp28"],
  ["QSFP-DD 400G", "/catalog?cat=qsfp-dd"],
  ["DAC / AOC", "/catalog?cat=dac-aoc"],
  ["Патч-корды", "/catalog?cat=patch"],
  ["CWDM / DWDM", "/catalog?cat=wdm"],
  ["Решения", "#solutions"],
];

const SOLUTIONS = [
  { title: "ЦОД 100G spine-leaf", desc: "QSFP28 LR4/SR4 + DAC для top-of-rack", href: "/catalog?cat=qsfp28" },
  { title: "Агрегация 25G", desc: "SFP28 LR/SR на leaf-коммутаторы", href: "/catalog?cat=sfp28" },
  { title: "Магистраль DWDM 80 км", desc: "DWDM-каналы + мультиплексоры", href: "/catalog?cat=wdm" },
  { title: "Доступ 10G", desc: "SFP+ LR/SR/BiDi для операторов", href: "/catalog?cat=sfp-plus" },
];

const TRUST = [
  { icon: FlaskConical, title: "Тестирование на оборудовании", desc: "Каждый модуль проверен на реальном железе вендора." },
  { icon: Truck, title: "Отгрузка в день заказа", desc: "Со склада в Москве, по заявке до 16:00." },
  { icon: ShieldCheck, title: "Гарантия 5 лет", desc: "Замена при любых отказах DOM/линка." },
  { icon: FileText, title: "Полные datasheet", desc: "Тех-данные, тест-отчёты, сертификаты CE/FCC/RoHS." },
];

export default async function Home() {
  const [tree, vendors, summary, popular] = await Promise.all([
    getCategoryTree(),
    getVendorsCascade(),
    getCompatSummaryByModel(),
    listProducts({ inStockOnly: true }, "popular", 1, 6),
  ]);

  const txChildren = tree.find((c) => c.slug === "transceivers")?.children ?? [];
  const rootExtra = tree.filter((c) => c.slug !== "transceivers");
  const tiles = [...txChildren, ...rootExtra];

  return (
    <>
      {/* утилити-бар */}
      <div className="border-b border-border bg-primary-muted/50 text-2xs text-muted-foreground">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-5 gap-y-1 px-6 py-1.5">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />{STOCK} позиций на складе в Москве</span>
          <span>Отгрузка в день заказа до 16:00</span>
          <span className="ml-auto hidden sm:inline">Прайс-лист (XLSX)</span>
          <span className="hidden sm:inline">API для интеграторов</span>
          <span className="mono">+7 495 120-40-90</span>
        </div>
      </div>

      <SiteHeader />

      {/* строка категорий */}
      <div className="border-b border-border bg-background/80">
        <div className="mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-6 py-2 text-sm">
          {CAT_NAV.map(([label, href]) => (
            <Link key={label} href={href} className="shrink-0 rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* hero */}
      <section className="page-head relative overflow-hidden border-b border-border">
        <div className="grid-bg absolute inset-0" />
        <div className="hero-glow" style={{ width: 420, height: 260, top: -120, right: "12%", background: "rgba(37,99,235,.18)" }} />
        <div className="fiber-line" style={{ top: "28%" }}><span className="pulse" style={{ "--d": "9s" } as React.CSSProperties} /></div>
        <div className="fiber-line" style={{ top: "64%" }}><span className="pulse" style={{ "--d": "12s", "--delay": "2s" } as React.CSSProperties} /></div>

        <div className="relative mx-auto grid max-w-[1320px] items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_minmax(380px,460px)]">
          <div>
            <div className="mono inline-flex items-center gap-3 rounded-full border border-border bg-card/60 px-3 py-1 text-2xs tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan" />850</span><span>·</span><span>1310</span><span>·</span><span>1550 NM</span>
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Оптика, которая заведётся{" "}
              <span className="bg-gradient-to-r from-primary to-cyan bg-clip-text text-transparent">с первого порта</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              SFP / SFP+ / SFP28 / QSFP+ / QSFP28 / QSFP-DD / OSFP, DAC/AOC, патч-корды и WDM. Кодирование под
              вендора, полная диагностика DOM, гарантия 5 лет.
            </p>

            {/* шкала длин волн */}
            <div className="mt-8 max-w-md">
              <div className="relative">
                <div className="absolute left-1.5 right-1.5 top-1.5 h-px bg-gradient-to-r from-cyan/50 via-primary/50 to-[#7c3aed]/50" />
                <div className="relative flex justify-between">
                  {WL.map((n) => (
                    <div key={n.wl} className="flex flex-col items-center gap-1">
                      <span className="h-3 w-3 rounded-full bg-cyan shadow-[0_0_10px_2px_rgba(34,211,238,.55)]" />
                      <span className="mono mt-1 text-sm font-medium">{n.wl}</span>
                      <span className="text-2xs uppercase tracking-wider text-muted-foreground">{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* статы */}
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
              {[
                { v: STOCK, l: "позиций на складе" },
                { v: "24 ч", l: "тест перед отгрузкой" },
                { v: "99.98%", l: "приёмка без дефектов" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="mono text-2xl font-semibold">{s.v}</div>
                  <div className="text-2xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-11 gap-1.5 bg-gradient-to-r from-primary to-cyan text-white shadow-sm hover:opacity-95"><Link href="/catalog">Открыть каталог <ArrowRight className="h-4 w-4" /></Link></Button>
              <CopilotButton className="h-11" />
            </div>
          </div>

          <ExpressPicker vendors={vendors} summary={summary} />
        </div>
      </section>

      <main className="mx-auto max-w-[1320px] px-6">
        {/* категории */}
        <Reveal><section className="py-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="text-2xs font-semibold uppercase tracking-wider text-primary/70">Ассортимент</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Категории</h2>
            </div>
            <Link href="/catalog" className="text-sm text-primary hover:underline">Весь каталог →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {tiles.map((c) => (
              <Link key={c.id} href={`/catalog?cat=${c.slug}`} className="group lift-hover rounded-lg border border-border bg-card p-4 shadow-sm">
                <CategoryGlyph slug={c.slug} formFactor={c.formFactor} className="h-16 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none" />
                <div className="mt-3 text-sm font-medium">{c.name}</div>
                <div className="mono text-2xs text-muted-foreground">{c.productCount} позиций</div>
              </Link>
            ))}
          </div>
        </section></Reveal>

        {/* готовые решения */}
        <Reveal><section id="solutions" className="scroll-mt-24 py-2">
          <div className="mb-5">
            <div className="text-2xs font-semibold uppercase tracking-wider text-cyan">Под задачу</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Готовые решения</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map((s) => (
              <Link key={s.title} href={s.href} className="group lift-hover flex flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="font-medium">{s.title}</div>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">Подобрать <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            ))}
          </div>
        </section></Reveal>

        {/* популярное на складе */}
        <Reveal><section className="py-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="text-2xs font-semibold uppercase tracking-wider text-success">В наличии сейчас</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Популярное на складе</h2>
            </div>
            <Link href="/catalog?stock=1" className="text-sm text-primary hover:underline">Всё в наличии →</Link>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-subtle text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Артикул</th>
                  <th className="px-4 py-2.5 text-left font-medium">Наименование</th>
                  <th className="px-4 py-2.5 text-right font-medium">Цена</th>
                  <th className="px-4 py-2.5 text-right font-medium">vs OEM</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {popular.items.map((p, i) => {
                  const sav = p.oemPrice ? Math.round(((p.oemPrice - p.priceBase) / p.oemPrice) * 100) : null;
                  return (
                    <tr key={p.sku} className={`transition-colors hover:bg-primary-muted/40 ${i % 2 ? "bg-subtle" : ""}`}>
                      <td className="px-4 py-2.5"><Link href={`/product/${p.sku}`} className="mono text-primary hover:underline">{p.sku}</Link></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{p.name}</td>
                      <td className="mono px-4 py-2.5 text-right font-medium tabular-nums">{ru(p.priceBase)} ₽</td>
                      <td className="px-4 py-2.5 text-right">{sav != null && sav > 0 ? <span className="text-success">−{sav}%</span> : "—"}</td>
                      <td className="px-4 py-2.5 text-right"><Badge variant="outline" className="gap-1.5 border-success/30 bg-success-muted text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />в наличии</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section></Reveal>
      </main>

      {/* CTA-якорь — цветной блок, разбивает «бело-на-белом» */}
      <Reveal><section className="relative overflow-hidden border-y border-border bg-primary text-primary-foreground">
        <div className="hero-glow" style={{ width: 360, height: 220, top: -120, left: "10%", background: "rgba(34,211,238,.25)" }} />
        <div className="relative mx-auto flex max-w-[1320px] flex-col items-start gap-5 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Не нашли модуль под проект?</h2>
            <p className="mt-1.5 max-w-xl text-primary-foreground/85">Со-пилот подберёт совместимые трансиверы и аналоги OEM по вашей задаче — или запросите спецификацию у инженера.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <CopilotButton label="Спросить со-пилота" className="h-11 bg-white text-primary hover:bg-white/90" />
            <Button asChild variant="outline" className="h-11 border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"><Link href="/cart">Запросить КП</Link></Button>
          </div>
        </div>
      </section></Reveal>

      {/* полоса доверия */}
      <Reveal><section className="page-head border-y border-border">
        <div className="relative mx-auto max-w-[1320px] px-6 py-10">
          <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Инженерное доверие, а не маркетинг</div>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => (
              <div key={t.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-muted text-cyan"><t.icon className="h-[18px] w-[18px]" /></span>
                <div>
                  <div className="text-sm font-medium">{t.title}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <hr className="spectrum-rule mt-8" />
        </div>
      </section></Reveal>

      <SiteFooter />

      <CopilotButton floating label="Со-пилот" />
    </>
  );
}
