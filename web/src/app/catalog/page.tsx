import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { FacetSidebar } from "./_components/facet-sidebar";
import { CatalogToolbar } from "./_components/catalog-toolbar";
import { listProducts, getFacets, getCategoryTree } from "@/lib/catalog";
import { parseCatalogParams, type SearchParamsObj } from "@/lib/catalog-params";

export const dynamic = "force-dynamic"; // состояние фасетов в query

const PAGE_SIZE = 24;

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParamsObj> }) {
  const sp = await searchParams;
  const { filters, sort, page } = parseCatalogParams(sp);

  const [list, facets, tree] = await Promise.all([
    listProducts(filters, sort, page, PAGE_SIZE),
    getFacets(filters),
    getCategoryTree(),
  ]);

  // ссылки пагинации (сохраняем остальные параметры)
  const pageHref = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string") next.set(k, v);
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    return next.toString() ? `/catalog?${next}` : "/catalog";
  };

  return (
    <>
      <SiteHeader initialQuery={filters.search ?? ""} />

      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight">Каталог</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Оптические трансиверы и сетевое оборудование — параметрический подбор.
          </p>
        </div>

        {/* мобильные фильтры */}
        <details className="mb-4 rounded-lg border border-border bg-card lg:hidden">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" /> Фильтры
          </summary>
          <div className="px-4 pb-4">
            <FacetSidebar facets={facets} tree={tree} currentCategory={filters.categorySlug} />
          </div>
        </details>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <FacetSidebar facets={facets} tree={tree} currentCategory={filters.categorySlug} />
            </div>
          </div>

          <div>
            <CatalogToolbar total={list.total} />

            {list.items.length === 0 ? (
              <div className="mt-10 rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
                Ничего не найдено. Попробуйте снять часть фильтров.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {list.items.map((p) => (
                  <ProductCard key={p.sku} p={p as ProductCardData} />
                ))}
              </div>
            )}

            {list.pages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-1">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">
                    ← Назад
                  </Link>
                )}
                {Array.from({ length: list.pages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    className={`mono rounded-md border px-3 py-1.5 text-sm ${p === page ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`}
                  >
                    {p}
                  </Link>
                ))}
                {page < list.pages && (
                  <Link href={pageHref(page + 1)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">
                    Вперёд →
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
