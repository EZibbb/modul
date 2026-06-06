import Link from "next/link";
import { LayoutDashboard, Package, Heart, FileStack, Building2, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAccountDashboard, getDemoCompanies } from "@/lib/account";
import type { SearchParamsObj } from "@/lib/catalog-params";

export const dynamic = "force-dynamic";

const M = (n: number) =>
  n >= 1e6 ? (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + " млн ₽" : n.toLocaleString("ru-RU") + " ₽";
const dt = (d: Date) => new Intl.DateTimeFormat("ru-RU").format(d);

const STATUS: Record<string, { label: string; cls: string }> = {
  delivered: { label: "доставлен", cls: "border-success/40 text-success" },
  shipped: { label: "в пути", cls: "border-info/40 text-info" },
  quote_pending: { label: "ждёт согласования", cls: "border-warning/40 text-warning" },
  new: { label: "новый", cls: "border-border text-muted-foreground" },
};

const NAV = [
  { icon: LayoutDashboard, label: "Дашборд", href: "#dash" },
  { icon: Package, label: "Заказы", href: "#orders" },
  { icon: Heart, label: "Избранное", href: "#favorites" },
  { icon: FileStack, label: "Шаблоны спецификаций", href: "#templates" },
  { icon: Building2, label: "Профиль и реквизиты", href: "#profile" },
];

export default async function AccountPage({ searchParams }: { searchParams: Promise<SearchParamsObj> }) {
  const sp = await searchParams;
  const companyId = typeof sp.company === "string" ? sp.company : undefined;
  const [companies, data] = await Promise.all([getDemoCompanies(), getAccountDashboard(companyId)]);

  if (!data) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-[1320px] px-6 py-16 text-center text-muted-foreground">Нет демо-аккаунтов.</main>
      </>
    );
  }

  const { company, user, kpi, orders, favorites, templates } = data;

  const kpis = [
    { label: "Заказов в этом году", value: String(kpi.ordersThisYear), sub: "оформлено" },
    { label: "Оборот", value: M(kpi.turnover), sub: "за 2026 год" },
    { label: "Сэкономлено vs OEM", value: M(kpi.savings), sub: "накопительно", accent: true },
    { label: "Активных КП", value: String(kpi.activeQuotes), sub: "ждут согласования" },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        {/* шапка кабинета */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Личный кабинет</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.name} · {company.name}
              {company.priceTier === "partner" && <Badge className="ml-2 bg-primary text-primary-foreground">партнёр</Badge>}
            </p>
          </div>
          {/* переключатель демо-клиента */}
          <div className="flex items-center gap-1.5">
            <span className="text-2xs text-muted-foreground">демо-клиент:</span>
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/account?company=${c.id}`}
                className={`rounded-md border px-2.5 py-1.5 text-sm ${
                  c.id === company.id ? "border-primary bg-primary-muted text-primary" : "border-border bg-card hover:bg-accent"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* боковая навигация */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-0.5 text-sm">
              {NAV.map((n) => (
                <a key={n.label} href={n.href} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                  <n.icon className="h-4 w-4" /> {n.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-10">
            {/* KPI */}
            <section id="dash" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className={`rounded-lg border p-4 ${k.accent ? "border-success/30 bg-success-muted" : "border-border bg-card"}`}>
                  <div className="text-2xs uppercase tracking-wide text-muted-foreground">{k.label}</div>
                  <div className={`mono mt-1 text-2xl font-semibold ${k.accent ? "text-success" : ""}`}>{k.value}</div>
                  <div className="mt-0.5 text-2xs text-muted-foreground">{k.sub}</div>
                </div>
              ))}
            </section>

            {/* история заказов */}
            <section id="orders">
              <h2 className="mb-3 text-lg font-semibold">История заказов</h2>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-subtle text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Заказ</th>
                      <th className="px-4 py-2.5 text-left font-medium">Дата</th>
                      <th className="px-4 py-2.5 text-left font-medium">Позиции</th>
                      <th className="px-4 py-2.5 text-right font-medium">Сумма</th>
                      <th className="px-4 py-2.5 text-left font-medium">Статус</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => {
                      const st = STATUS[o.status] ?? STATUS.new;
                      return (
                        <tr key={o.id} className={i % 2 ? "bg-subtle" : ""}>
                          <td className="mono px-4 py-2.5 text-primary">{o.number}</td>
                          <td className="mono px-4 py-2.5 tabular-nums text-muted-foreground">{dt(o.date)}</td>
                          <td className="max-w-[280px] truncate px-4 py-2.5 text-muted-foreground">{o.summary}</td>
                          <td className="mono px-4 py-2.5 text-right font-medium tabular-nums">{o.total.toLocaleString("ru-RU")} ₽</td>
                          <td className="px-4 py-2.5"><Badge variant="outline" className={st.cls}>{st.label}</Badge></td>
                          <td className="px-4 py-2.5 text-right">
                            <Button variant="outline" size="sm" className="gap-1"><RotateCcw className="h-3.5 w-3.5" /> Повторить</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* избранное */}
            <section id="favorites">
              <h2 className="mb-3 text-lg font-semibold">Избранное</h2>
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">Пока пусто.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {favorites.map((p) => (
                    <ProductCard key={p.sku} p={p as ProductCardData} />
                  ))}
                </div>
              )}
            </section>

            {/* шаблоны */}
            <section id="templates">
              <h2 className="mb-3 text-lg font-semibold">Шаблоны спецификаций</h2>
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет сохранённых шаблонов.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {templates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                      <div>
                        <div className="font-medium">{(t.payload as { note?: string } | null)?.note ?? t.code}</div>
                        <div className="mono text-2xs text-muted-foreground">{t.code} · {t.type}</div>
                      </div>
                      <Button variant="outline" size="sm">Открыть</Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* профиль */}
            <section id="profile">
              <h2 className="mb-3 text-lg font-semibold">Профиль и реквизиты</h2>
              <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-2 text-sm">
                <div><div className="text-2xs uppercase tracking-wide text-muted-foreground">Компания</div><div className="mt-0.5">{company.name}</div></div>
                <div><div className="text-2xs uppercase tracking-wide text-muted-foreground">ИНН</div><div className="mono mt-0.5">{company.inn ?? "—"}</div></div>
                <div><div className="text-2xs uppercase tracking-wide text-muted-foreground">Контакт</div><div className="mt-0.5">{user?.name} ({user?.email})</div></div>
                <div><div className="text-2xs uppercase tracking-wide text-muted-foreground">Тариф</div><div className="mt-0.5">{company.priceTier === "partner" ? "Партнёрский" : "Базовый"}</div></div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
