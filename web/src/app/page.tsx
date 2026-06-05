import { ThemeToggle } from "./_ThemeToggle";

const brand = [
  { name: "primary", cls: "bg-primary", fg: "text-primary-foreground" },
  { name: "cyan", cls: "bg-cyan", fg: "text-white" },
  { name: "success", cls: "bg-success", fg: "text-white" },
  { name: "warning", cls: "bg-warning", fg: "text-white" },
  { name: "destructive", cls: "bg-destructive", fg: "text-destructive-foreground" },
  { name: "info", cls: "bg-info", fg: "text-white" },
];

export default function Home() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-4 px-6">
          <span className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Modul<span className="font-normal text-muted-foreground">&nbsp;comp</span>
            </span>
            <span className="mono text-2xs rounded bg-muted px-1.5 py-0.5 text-muted-foreground">foundation</span>
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] space-y-12 px-6 py-12">
        <section>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="mono">850 · 1310 · 1550 NM</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Инженерная точность как интерфейс
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Фундамент дизайн-токенов подключён: палитра (light/dark), Inter + IBM&nbsp;Plex&nbsp;Mono,
            радиусы, тени. Артикул моноширинным: <span className="mono text-primary">MC-SFP10G-LR</span>.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Бренд и семантика</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {brand.map((c) => (
              <div key={c.name} className={`flex h-20 items-end rounded-lg p-3 shadow-sm ${c.cls} ${c.fg}`}>
                <span className="mono text-2xs">{c.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Карточка-проба</h2>
          <div className="max-w-sm rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="mono text-sm text-primary">MC-QSFP100G-LR4</span>
              <span className="rounded-full bg-success-muted px-2 py-0.5 text-2xs font-medium text-success">в наличии</span>
            </div>
            <h3 className="mt-2 font-semibold">QSFP28 100GBASE-LR4</h3>
            <p className="mt-1 text-sm text-muted-foreground">CWDM4 · 1310 нм · 10 км · LC · DOM</p>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="mono text-lg font-semibold">22&nbsp;500&nbsp;₽</span>
              <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary-hover">
                + в спецификацию
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
