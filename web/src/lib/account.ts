// Сервис личного кабинета (модуль F): дашборд демо-клиента — KPI, заказы, избранное, шаблоны.
import { prisma } from "@/lib/db";

export async function getDemoCompanies() {
  return prisma.company.findMany({
    select: { id: true, name: true, priceTier: true },
    orderBy: [{ priceTier: "desc" }, { name: "asc" }], // партнёр первым
  });
}

export async function getAccountDashboard(companyId?: string) {
  const company = companyId
    ? await prisma.company.findUnique({ where: { id: companyId }, include: { users: true } })
    : await prisma.company.findFirst({ orderBy: [{ priceTier: "desc" }, { name: "asc" }], include: { users: true } });
  if (!company) return null;

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
  const activeQuotes = orders.filter((o) => o.type === "quote" && o.status === "quote_pending").length;

  const user = company.users[0] ?? null;
  const [favorites, templates] = user
    ? await Promise.all([
        prisma.favorite.findMany({ where: { userId: user.id }, include: { product: true } }),
        prisma.savedConfig.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      ])
    : [[], []];

  return {
    company,
    user,
    kpi: { ordersThisYear: realOrders.length, turnover, savings, activeQuotes },
    orders: orders.map((o) => ({
      id: o.id,
      number: `MC-${o.id.slice(-5).toUpperCase()}`,
      type: o.type,
      status: o.status,
      date: o.createdAt,
      total: orderTotal(o),
      summary: o.items.map((it) => `${it.product.sku} ×${it.qty}`).join(", "),
    })),
    favorites: favorites.map((f) => f.product),
    templates,
  };
}
