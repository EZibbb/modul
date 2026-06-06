// URL ↔ CatalogFilters (W06: состояние фасетов в query-params — шаринг + SEO).
import type { CatalogFilters, CatalogSort } from "./catalog";

export type SearchParamsObj = Record<string, string | string[] | undefined>;

const SORTS: CatalogSort[] = ["popular", "price-asc", "price-desc", "speed-desc", "reach-desc"];

// Лейблы фасетов (client-safe — без серверных импортов).
export const TEMP_LABELS: Record<string, string> = {
  com: "0…+70 °C (коммерческий)",
  ext: "−20…+85 °C (расширенный)",
  ind: "−40…+85 °C (индустриальный)",
};

export const SORT_LABELS: Record<CatalogSort, string> = {
  popular: "Популярные",
  "price-asc": "Цена ↑",
  "price-desc": "Цена ↓",
  "speed-desc": "Скорость ↓",
  "reach-desc": "Дальность ↓",
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const csvNums = (v: string | string[] | undefined) => {
  const s = first(v);
  if (!s) return undefined;
  const arr = s.split(",").map(Number).filter((n) => !Number.isNaN(n));
  return arr.length ? arr : undefined;
};
const csvStrs = (v: string | string[] | undefined) => {
  const s = first(v);
  if (!s) return undefined;
  const arr = s.split(",").filter(Boolean);
  return arr.length ? arr : undefined;
};

export function parseCatalogParams(sp: SearchParamsObj): {
  filters: CatalogFilters;
  sort: CatalogSort;
  page: number;
} {
  const num = (v: string | string[] | undefined) => {
    const n = Number(first(v));
    return Number.isFinite(n) ? n : undefined;
  };
  const sortRaw = first(sp.sort) as CatalogSort | undefined;
  const sort = sortRaw && SORTS.includes(sortRaw) ? sortRaw : "popular";
  const page = Math.max(1, num(sp.page) ?? 1);

  const filters: CatalogFilters = {
    categorySlug: first(sp.cat) || undefined,
    speedGbps: csvNums(sp.speed),
    mediaType: csvStrs(sp.media),
    connector: csvStrs(sp.conn),
    wavelengthNm: csvNums(sp.wl),
    tempRange: csvStrs(sp.temp),
    domSupport: first(sp.dom) === "1" ? true : undefined,
    reachMin: num(sp.reachMin),
    reachMax: num(sp.reachMax),
    compatibleWithModelId: first(sp.compat) || undefined,
    search: first(sp.q) || undefined,
    inStockOnly: first(sp.stock) === "1" ? true : undefined,
  };
  return { filters, sort, page };
}

// Ключи query ↔ фасеты (для клиентских тоглов).
export const FACET_PARAM = {
  speedGbps: "speed",
  mediaType: "media",
  connector: "conn",
  wavelengthNm: "wl",
  tempRange: "temp",
} as const;

// Тогл значения в csv-параметре. Возвращает новую строку URLSearchParams.
export function toggleCsv(params: URLSearchParams, key: string, value: string): URLSearchParams {
  const next = new URLSearchParams(params);
  const cur = next.get(key)?.split(",").filter(Boolean) ?? [];
  const idx = cur.indexOf(value);
  if (idx >= 0) cur.splice(idx, 1);
  else cur.push(value);
  if (cur.length) next.set(key, cur.join(","));
  else next.delete(key);
  next.delete("page"); // смена фильтра → на 1-ю страницу
  return next;
}
