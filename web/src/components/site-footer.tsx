import Link from "next/link";

const COLS = [
  { title: "Каталог", links: [["SFP+ (10G)", "/catalog?cat=sfp-plus"], ["SFP28 (25G)", "/catalog?cat=sfp28"], ["QSFP28 (100G)", "/catalog?cat=qsfp28"], ["DAC / AOC", "/catalog?cat=dac-aoc"]] },
  { title: "Инструменты", links: [["Подбор совместимости", "/compatibility"], ["Калькулятор оптбюджета", "/calculator"], ["Декодер артикула", "/decoder"], ["Диагностика DOM", "/dom"], ["Калькулятор экономии", "/economy"], ["Заказ по Excel", "/order-excel"]] },
  { title: "Компания", links: [["О нас", "#"], ["Доставка", "#"], ["Контакты", "#"], ["API для интеграторов", "#"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Modul<span className="font-normal text-muted-foreground">&nbsp;comp</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Оптические трансиверы и сетевое оборудование для инженеров. Тестирование на оборудовании, кодирование под вендора.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</div>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-muted-foreground hover:text-foreground">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2 px-6 py-4 text-2xs text-muted-foreground">
          <span>© 2026 Modul comp. Демо-продукт. Товарные знаки принадлежат правообладателям.</span>
          <span className="mono">SFP · SFP+ · SFP28 · QSFP+ · QSFP28 · QSFP-DD · DAC/AOC · CWDM/DWDM</span>
        </div>
      </div>
    </footer>
  );
}
