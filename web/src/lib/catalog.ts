// Сервис каталога (модуль A): фасетный поиск со счётчиками, категории, автодополнение.
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export type CatalogFilters = {
  categorySlug?: string;
  speedGbps?: number[];
  mediaType?: string[];
  connector?: string[];
  wavelengthNm?: number[];
  tempRange?: string[];
  domSupport?: boolean;
  reachMin?: number;
  reachMax?: number;
  compatibleWithModelId?: string; // мост к B (совместимость)
  search?: string;
  inStockOnly?: boolean;
};

export type CatalogSort = "popular" | "price-asc" | "price-desc" | "speed-desc" | "reach-desc";

type ExcludeKey = "speedGbps" | "mediaType" | "connector" | "wavelengthNm" | "tempRange" | "domSupport" | "reach";

// Лейблы фасетов (человекочитаемо)
export const TEMP_LABELS: Record<string, string> = {
  com: "0…+70 °C (коммерческий)",
  ext: "−20…+85 °C (расширенный)",
  ind: "−40…+85 °C (индустриальный)",
};

function buildWhere(f: CatalogFilters, exclude?: ExcludeKey): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];
  if (f.categorySlug) and.push({ category: { slug: f.categorySlug } });
  if (exclude !== "speedGbps" && f.speedGbps?.length) and.push({ speedGbps: { in: f.speedGbps } });
  if (exclude !== "mediaType" && f.mediaType?.length) and.push({ mediaType: { in: f.mediaType } });
  if (exclude !== "connector" && f.connector?.length) and.push({ connector: { in: f.connector } });
  if (exclude !== "wavelengthNm" && f.wavelengthNm?.length) and.push({ wavelengthNm: { in: f.wavelengthNm } });
  if (exclude !== "tempRange" && f.tempRange?.length) and.push({ tempRange: { in: f.tempRange } });
  if (exclude !== "domSupport" && f.domSupport != null) and.push({ domSupport: f.domSupport });
  if (exclude !== "reach" && (f.reachMin != null || f.reachMax != null))
    and.push({ reachM: { gte: f.reachMin ?? undefined, lte: f.reachMax ?? undefined } });
  if (f.inStockOnly) and.push({ stockStatus: "in" });
  if (f.compatibleWithModelId) and.push({ compatibilities: { some: { deviceModelId: f.compatibleWithModelId } } });
  if (f.search?.trim()) {
    const q = f.search.trim();
    and.push({ OR: [{ sku: { contains: q } }, { name: { contains: q } }, { mpn: { contains: q } }] });
  }
  return and.length ? { AND: and } : {};
}

function orderBy(sort: CatalogSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ priceBase: "asc" }];
    case "price-desc":
      return [{ priceBase: "desc" }];
    case "speed-desc":
      return [{ speedGbps: "desc" }, { priceBase: "asc" }];
    case "reach-desc":
      return [{ reachM: "desc" }];
    case "popular":
    default:
      // в наличии ("in" < "order") → скорость → артикул
      return [{ stockStatus: "asc" }, { speedGbps: "desc" }, { sku: "asc" }];
  }
}

export async function listProducts(
  f: CatalogFilters,
  sort: CatalogSort = "popular",
  page = 1,
  pageSize = 24,
) {
  const where = buildWhere(f);
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: orderBy(sort), skip: (page - 1) * pageSize, take: pageSize }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export type Facet = { value: string | number; label: string; count: number };
export type Facets = {
  speedGbps: Facet[];
  mediaType: Facet[];
  connector: Facet[];
  wavelengthNm: Facet[];
  tempRange: Facet[];
  domSupport: { yes: number; total: number };
  reach: { min: number; max: number };
};

// Дизъюнктивные фасеты: счётчик каждого значения считается БЕЗ фильтра по этому же фасету.
export async function getFacets(f: CatalogFilters): Promise<Facets> {
  const count = (rows: { _count: { _all: number } }[], key: string) =>
    rows.map((r) => ({ value: (r as Record<string, unknown>)[key] as string | number, count: r._count._all }));

  const [speed, media, conn, wl, temp, domYes, reachAgg] = await Promise.all([
    prisma.product.groupBy({ by: ["speedGbps"], where: buildWhere(f, "speedGbps"), _count: { _all: true } }),
    prisma.product.groupBy({ by: ["mediaType"], where: buildWhere(f, "mediaType"), _count: { _all: true } }),
    prisma.product.groupBy({ by: ["connector"], where: buildWhere(f, "connector"), _count: { _all: true } }),
    prisma.product.groupBy({ by: ["wavelengthNm"], where: buildWhere(f, "wavelengthNm"), _count: { _all: true } }),
    prisma.product.groupBy({ by: ["tempRange"], where: buildWhere(f, "tempRange"), _count: { _all: true } }),
    prisma.product.count({ where: { AND: [buildWhere(f, "domSupport"), { domSupport: true }] } }),
    prisma.product.aggregate({ where: buildWhere(f, "reach"), _min: { reachM: true }, _max: { reachM: true } }),
  ]);

  const clean = (rows: { value: string | number; count: number }[]) =>
    rows.filter((r) => r.value != null && r.value !== "");

  return {
    speedGbps: clean(count(speed, "speedGbps"))
      .map((r) => ({ ...r, label: `${r.value}G` }))
      .sort((a, b) => Number(a.value) - Number(b.value)),
    mediaType: clean(count(media, "mediaType"))
      .map((r) => ({ ...r, label: String(r.value) }))
      .sort((a, b) => b.count - a.count),
    connector: clean(count(conn, "connector"))
      .map((r) => ({ ...r, label: String(r.value) }))
      .sort((a, b) => b.count - a.count),
    wavelengthNm: clean(count(wl, "wavelengthNm"))
      .map((r) => ({ ...r, label: `${r.value} нм` }))
      .sort((a, b) => Number(a.value) - Number(b.value)),
    tempRange: clean(count(temp, "tempRange"))
      .map((r) => ({ ...r, label: TEMP_LABELS[String(r.value)] ?? String(r.value) })),
    domSupport: { yes: domYes, total: await prisma.product.count({ where: buildWhere(f, "domSupport") }) },
    reach: { min: reachAgg._min.reachM ?? 0, max: reachAgg._max.reachM ?? 0 },
  };
}

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  formFactor: string | null;
  productCount: number;
  children: CategoryNode[];
};

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const cats = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const node = (c: (typeof cats)[number]): CategoryNode => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    formFactor: c.formFactor,
    productCount: c._count.products,
    children: cats.filter((x) => x.parentId === c.id).map(node),
  });
  return cats.filter((c) => c.parentId == null).map(node);
}

export async function searchProducts(q: string, limit = 8) {
  const query = q.trim();
  if (!query) return [];
  return prisma.product.findMany({
    where: { OR: [{ sku: { contains: query } }, { name: { contains: query } }, { mpn: { contains: query } }] },
    select: { id: true, sku: true, name: true, speedGbps: true, mediaType: true, stockStatus: true, priceBase: true },
    take: limit,
    orderBy: [{ stockStatus: "asc" }, { sku: "asc" }],
  });
}

export async function getProductBySku(sku: string) {
  return prisma.product.findUnique({
    where: { sku },
    include: {
      category: true,
      compatibilities: {
        include: {
          deviceModel: { include: { series: { include: { vendor: true } } } },
          portGroup: true,
        },
      },
    },
  });
}
