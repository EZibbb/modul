// Сервис личного кабинета (модуль F): дашборд демо-клиента — KPI, заказы, избранное, шаблоны.
import { prisma } from "@/lib/db";

type Manager = { name: string; phone: string; email: string };
type Requisites = { inn?: string; kpp?: string; address?: string; manager?: Manager; discountPct?: number };

export async function getDemoCompanies() {
  return prisma.company.findMany({
    select: { id: true, name: true, priceTier: true },
    orderBy: [{ priceTier: "desc" }, { name: "asc" }], // партнёр первым
  });
}

const reachKm = (m: number | null) => (m == null ? null : m >= 1000 ? `${m / 1000}км` : `${m}м`);
function favSpec(p: { mediaType: string | null; reachM: number | null; connector: string | null }) {
  const mt = p.mediaType ?? "";
  if (["CWDM4", "CWDM", "DWDM", "BiDi", "PSM4"].includes(mt)) return mt;
  if (mt === "copper") return [reachKm(p.reachM), "DAC"].filter(Boolean).join(" · ");
  if (mt === "AOC") return [reachKm(p.reachM), "AOC"].filter(Boolean).join(" · ");
  return [reachKm(p.reachM), p.connector].filter(Boolean).join(" · ");
}

export async function getAccountDashboard(companyId?: string) {
  const company = companyId
    ? await prisma.company.findUnique({ where: { id: companyId }, include: { users: true } })
    : await prisma.company.findFirst({ orderBy: [{ priceTier: "desc" }, { name: "asc" }], include: { users: true } });
  if (!company) return null;

  const req = (company.requisites as Requisites | null) ?? {};

  const orders = await prisma.order.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { sku: true, name: true, oemPrice: true } } } } },
  });

  const orderTotal = (o: (typeof orders)[number]) => o.items.reduce((s, it) => s + it.priceAt * it.qty, 0);
  const realOrders = orders.filter((o) => o.type === "order");
  const turnover = realOrders.reduce((s, o) => s + orderTotal(o), 0);
  const savings = realOrders.reduce(
    (s, o) => s + o.items.reduce((a, it) => a + (it.product.oemPrice ? (it.product.oemPrice - it.priceAt) * it.qty : 0), 0),
    0,
  );
  const quotes = orders.filter((o) => o.type === "quote");
  const activeQuotes = quotes.filter((o) => o.status === "quote_pending" || o.status === "quote_sent").length;
  const pendingQuotes = quotes.filter((o) => o.status === "quote_pending").length;
  const quarterAgo = new Date(Date.now() - 90 * 864e5);
  const ordersThisQuarter = realOrders.filter((o) => o.createdAt >= quarterAgo).length;

  const user = company.users[0] ?? null;
  const [favorites, templates] = user
    ? await Promise.all([
        prisma.favorite.findMany({ where: { userId: user.id }, include: { product: true } }),
        prisma.savedConfig.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      ])
    : [[], []];

  return {
    company: {
      name: company.name,
      inn: company.inn,
      priceTier: company.priceTier,
      address: req.address ?? null,
      discountPct: req.discountPct ?? 0,
      manager: req.manager ?? null,
    },
    user: user ? { name: user.name, email: user.email } : null,
    kpi: { ordersThisYear: realOrders.length, ordersThisQuarter, turnover, savings, activeQuotes, pendingQuotes },
    orders: orders.map((o) => ({
      id: o.id,
      number: `#MC-${(o.customerJson as { no?: number } | null)?.no ?? o.id.slice(-5)}`,
      type: o.type,
      status: o.status,
      date: new Intl.DateTimeFormat("ru-RU").format(o.createdAt),
      total: orderTotal(o),
      summary: o.items.map((it) => `${it.product.sku.replace(/^MC-/, "")} ×${it.qty}`).join(", "),
    })),
    favorites: favorites.map((f) => ({
      sku: f.product.sku,
      spec: favSpec(f.product),
      priceBase: f.product.priceBase,
    })),
    templates: templates.map((t) => {
      const p = (t.payload as { name?: string; positions?: number; total?: number } | null) ?? {};
      return { id: t.id, code: t.code, name: p.name ?? t.code, positions: p.positions ?? 0, total: p.total ?? 0 };
    }),
  };
}
