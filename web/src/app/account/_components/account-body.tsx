"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard, Package, Heart, FileStack, Building2, Bell, RotateCcw, FileText, Plus, ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { getAccountDashboard } from "@/lib/account";

type Data = NonNullable<Awaited<ReturnType<typeof getAccountDashboard>>>;
type Tab = "dash" | "orders" | "favorites" | "templates" | "profile" | "notifications";

const ru = (n: number) => n.toLocaleString("ru-RU");
const M = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + " М" : ru(n) + " ₽");

const STATUS: Record<string, { label: string; cls: string }> = {
  delivered: { label: "доставлен", cls: "bg-success-muted text-success" },
  shipped: { label: "в пути", cls: "bg-info-muted text-info" },
  quote_pending: { label: "ждёт согласования", cls: "bg-warning-muted text-warning" },
  quote_sent: { label: "КП отправлено", cls: "bg-info-muted text-info" },
  new: { label: "новый", cls: "bg-muted text-muted-foreground" },
};

const NAV: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dash", label: "Дашборд", icon: LayoutDashboard },
  { id: "orders", label: "Заказы", icon: Package },
  { id: "favorites", label: "Избранное", icon: Heart },
  { id: "templates", label: "Шаблоны спецификаций", icon: FileStack },
  { id: "profile", label: "Профиль и реквизиты", icon: Building2 },
  { id: "notifications", label: "Уведомления", icon: Bell },
];

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.new;
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium ${s.cls}`}>{s.label}</span>;
}

function OrdersTable({ orders }: { orders: Data["orders"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-subtle text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Заказ</th>
            <th className="px-4 py-2.5 font-medium">Дата</th>
            <th className="px-4 py-2.5 font-medium">Позиции</th>
            <th className="px-4 py-2.5 text-right font-medium">Сумма</th>
            <th className="px-4 py-2.5 text-center font-medium">Статус</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-accent/50">
              <td className="mono px-4 py-3 font-medium text-primary">{o.number}</td>
              <td className="mono tnum px-4 py-3 text-muted-foreground">{o.date}</td>
              <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">{o.summary}</td>
              <td className="mono tnum px-4 py-3 text-right font-medium">{ru(o.total)} ₽</td>
              <td className="px-4 py-3 text-center"><StatusPill status={o.status} /></td>
              <td className="px-4 py-3 text-right">
                <Button variant="outline" size="sm" className="h-8 gap-1"><RotateCcw className="h-3.5 w-3.5" /> Повторить</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TemplatesPanel({ templates }: { templates: Data["templates"] }) {
  return (
    <div className="divide-y divide-border">
      {templates.map((t) => (
        <div key={t.id} className="flex items-center gap-3 p-4 hover:bg-accent/50">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary"><FileText className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{t.name}</div>
            <div className="mono text-xs text-muted-foreground">{t.positions} позиций · {ru(t.total)} ₽</div>
          </div>
          <Button size="sm" className="h-8 gap-1"><ShoppingCart className="h-3.5 w-3.5" /> В корзину</Button>
        </div>
      ))}
      {templates.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Нет шаблонов.</div>}
    </div>
  );
}

function FavoritesPanel({ favorites }: { favorites: Data["favorites"] }) {
  return (
    <div className="divide-y divide-border">
      {favorites.map((f) => (
        <div key={f.sku} className="flex items-center gap-3 p-3 hover:bg-accent/50">
          <Link href={`/product/${f.sku}`} className="mono text-sm font-medium text-primary hover:underline">{f.sku}</Link>
          {f.spec && <span className="text-xs text-muted-foreground">{f.spec}</span>}
          <span className="mono ml-auto text-sm font-semibold">{ru(f.priceBase)} ₽</span>
        </div>
      ))}
      {favorites.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Пусто.</div>}
    </div>
  );
}

const Panel = ({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {count != null && <span className="mono text-2xs text-muted-foreground">{count}</span>}
    </div>
    {children}
  </div>
);

export function AccountBody({ data }: { data: Data }) {
  const [tab, setTab] = useState<Tab>("dash");
  const { kpi, orders, favorites, templates, company, user } = data;

  const kpis = [
    { label: "Заказов в этом году", value: String(kpi.ordersThisYear), sub: `+${kpi.ordersThisQuarter} за квартал`, subCls: "text-success" },
    { label: "Оборот, ₽", value: M(kpi.turnover), sub: "за 2026 год", subCls: "text-muted-foreground" },
    { label: "Сэкономлено vs OEM", value: M(kpi.savings), sub: "накопительно", subCls: "text-success/80", accent: true },
    { label: "Активных КП", value: String(kpi.activeQuotes), sub: `${kpi.pendingQuotes} ждут согласования`, subCls: "text-warning" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* сайдбар — переключает вкладки */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {NAV.map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm ${
                  active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="space-y-6">
        {tab === "dash" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className={`rounded-xl border p-4 ${k.accent ? "border-success/30 bg-success-muted" : "border-border bg-card"}`}>
                  <div className={`text-2xs ${k.accent ? "text-success/80" : "text-muted-foreground"}`}>{k.label}</div>
                  <div className={`tnum mt-1 text-2xl font-semibold ${k.accent ? "text-success" : ""}`}>{k.value}</div>
                  <div className={`mt-1 text-2xs ${k.subCls}`}>{k.sub}</div>
                </div>
              ))}
            </div>

            <Panel title="История заказов">
              <div className="flex items-center justify-end border-b border-border px-4 py-2">
                <button onClick={() => setTab("orders")} className="text-xs font-medium text-primary hover:underline">Все заказы →</button>
              </div>
              <OrdersTable orders={orders.filter((o) => o.type === "order").slice(0, 5)} />
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Шаблоны спецификаций" count={templates.length}><TemplatesPanel templates={templates} /></Panel>
              <Panel title="Избранное" count={favorites.length}><FavoritesPanel favorites={favorites} /></Panel>
            </div>
          </>
        )}

        {tab === "orders" && <Panel title="Все заказы" count={orders.length}><OrdersTable orders={orders} /></Panel>}
        {tab === "favorites" && <Panel title="Избранное" count={favorites.length}><FavoritesPanel favorites={favorites} /></Panel>}
        {tab === "templates" && <Panel title="Шаблоны спецификаций" count={templates.length}><TemplatesPanel templates={templates} /></Panel>}

        {tab === "profile" && (
          <Panel title="Профиль и реквизиты">
            <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
              <Field label="Компания" value={company.name} />
              <Field label="ИНН" value={company.inn ?? "—"} mono />
              <Field label="Адрес" value={company.address ?? "—"} />
              <Field label="Тариф" value={company.priceTier === "partner" ? `Партнёрский · скидка ${company.discountPct}%` : "Базовый"} />
              <Field label="Контактное лицо" value={user?.name ?? "—"} />
              <Field label="E-mail" value={user?.email ?? "—"} mono />
              {company.manager && (
                <>
                  <Field label="Персональный менеджер" value={company.manager.name} />
                  <Field label="Телефон менеджера" value={company.manager.phone} mono />
                  <Field label="E-mail менеджера" value={company.manager.email} mono />
                </>
              )}
            </div>
          </Panel>
        )}

        {tab === "notifications" && (
          <Panel title="Уведомления">
            <div className="p-6 text-sm text-muted-foreground">Нет новых уведомлений. Здесь будут статусы заказов и согласования КП.</div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-2xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "mono" : ""}`}>{value}</div>
    </div>
  );
}
