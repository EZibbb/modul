import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Check, Heart, FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToSpec } from "@/components/add-to-spec";
import { AddToCompare } from "@/components/add-to-compare";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getProductBySku, getRelatedProducts } from "@/lib/catalog";
import { getCompatForProduct } from "@/lib/compat";
import { TEMP_LABELS } from "@/lib/catalog-params";

const ru = (n: number) => n.toLocaleString("ru-RU");
const reach = (m: number | null) => (m == null ? null : m >= 1000 ? `${m / 1000} км` : `${m} м`);

// DOM/DDM пороги (SPEC §9.5) — референс-данные.
const DOM_THRESHOLDS = [
  { param: "Температура", unit: "°C", la: -5, lw: 0, hw: 70, ha: 75 },
  { param: "Напряжение питания", unit: "В", la: 2.97, lw: 3.13, hw: 3.46, ha: 3.63 },
  { param: "Ток смещения лазера", unit: "mA", la: 2, lw: 3, hw: 11, ha: 13 },
  { param: "Tx Power", unit: "dBm", la: -8.2, lw: -5.2, hw: -1.0, ha: 0.5 },
  { param: "Rx Power", unit: "dBm", la: -14.4, lw: -11.4, hw: 0.5, ha: 2.0 },
];

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const product = await getProductBySku(decodeURIComponent(sku));
  if (!product) notFound();

  const [compat, related] = await Promise.all([
    getCompatForProduct(product.id),
    getRelatedProducts(product.sku, product.categoryId, product.speedGbps, 4),
  ]);

  const savings = product.oemPrice
    ? Math.round(((product.oemPrice - product.priceBase) / product.oemPrice) * 100)
    : null;
  const fw = (product.firmwareOptions as string[] | null) ?? [];
  const certs = (product.certifications as string[] | null) ?? [];

  const specs: [string, string | null][] = [
    ["Форм-фактор", product.formFactor],
    ["Скорость", product.speedGbps ? `${product.speedGbps} Гбит/с` : null],
    ["Стандарт / тип", product.mediaType],
    ["Длина волны", product.wavelengthNm ? `${product.wavelengthNm} нм` : null],
    ["Канал DWDM", product.dwdmChannel],
    ["Дальность", reach(product.reachM)],
    ["Тип лазера", product.laserType],
    ["Тип волокна", product.fiberType],
    ["Разъём", product.connector],
    ["Температурный диапазон", product.tempRange ? (TEMP_LABELS[product.tempRange] ?? product.tempRange) : null],
    ["Поддержка DOM/DDM", product.domSupport ? "Да" : "Нет"],
    ["Габариты", product.dimensions],
    ["Вес", product.weightG ? `${product.weightG} г` : null],
    ["Потребление", product.powerConsumptionW ? `${product.powerConsumptionW} Вт` : null],
    ["Сертификаты", certs.length ? certs.join(" · ") : null],
    ["Артикул производителя (MPN)", product.mpn],
  ];
  const specRows = specs.filter(([, v]) => v != null) as [string, string][];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        {/* хлебные крошки */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/catalog" className="hover:text-foreground">Каталог</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/catalog?cat=${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="mono text-foreground">{product.sku}</span>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_minmax(360px,420px)]">
          {/* галерея (плейсхолдер, W04) */}
          <div>
            <div className="flex h-80 items-center justify-center rounded-lg border border-border bg-gradient-to-br from-muted to-subtle">
              <span className="mono rounded bg-card/80 px-3 py-1.5 text-sm text-muted-foreground">{product.formFactor}</span>
            </div>
            <div className="mt-3 flex gap-3">
              {["Модуль", "Габариты", "DOM-консоль"].map((t, i) => (
                <div key={i} className="flex h-16 w-20 items-center justify-center rounded-md border border-border bg-muted text-2xs text-muted-foreground">{t}</div>
              ))}
            </div>
          </div>

          {/* инфо-панель */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="mono text-sm font-medium text-primary">{product.sku}</span>
              {product.domSupport && <span className="mono text-2xs rounded bg-muted px-1 py-0.5 text-muted-foreground">DOM</span>}
              {compat.some((c) => c.tested) && (
                <Badge variant="outline" className="gap-1 border-success/40 text-success">
                  <Check className="h-3 w-3" /> протестировано
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-semibold leading-snug">{product.name}</h1>

            {/* цена */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="mono text-2xl font-semibold">{ru(product.priceBase)}&nbsp;₽</div>
                  {product.pricePartner && (
                    <div className="mono text-sm text-muted-foreground">партнёру {ru(product.pricePartner)}&nbsp;₽</div>
                  )}
                </div>
                {savings != null && savings > 0 && (
                  <div className="text-right">
                    <Badge className="bg-success text-white">−{savings}% к OEM</Badge>
                    {product.oemRef && <div className="mt-1 text-2xs text-muted-foreground">{product.oemRef}: {ru(product.oemPrice!)} ₽</div>}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                {product.stockStatus === "in" ? (
                  <Badge variant="outline" className="border-success/40 bg-success-muted text-success">в наличии</Badge>
                ) : (
                  <Badge variant="outline" className="border-warning/40 bg-warning-muted text-warning">
                    под заказ{product.leadTimeDays ? ` ${product.leadTimeDays} дн` : ""}
                  </Badge>
                )}
              </div>

              {/* прошивка (D-007 Вариант А) */}
              {fw.length > 0 && (
                <div className="mt-4">
                  <label className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">Прошивка</label>
                  <select className="mono mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {fw.map((f) => (
                      <option key={f} value={f}>{f === "Generic" ? "Универсальный (Generic)" : f}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-2xs text-muted-foreground">Программируется на складе под вендора, +0 дней.</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <AddToSpec
                  className="col-span-2 h-10"
                  size="lg"
                  item={{ sku: product.sku, name: product.name, priceBase: product.priceBase, pricePartner: product.pricePartner, oemPrice: product.oemPrice }}
                />
                <AddToCompare
                  variant="outline"
                  item={{
                    sku: product.sku, name: product.name, formFactor: product.formFactor, speedGbps: product.speedGbps,
                    mediaType: product.mediaType, reachM: product.reachM, wavelengthNm: product.wavelengthNm,
                    connector: product.connector, tempRange: product.tempRange, domSupport: product.domSupport,
                    priceBase: product.priceBase, oemPrice: product.oemPrice,
                  }}
                />
                <Button variant="outline" className="gap-1.5"><Heart className="h-4 w-4" /> В избранное</Button>
              </div>
            </div>
          </div>
        </div>

        {/* вкладки */}
        <div className="mt-10">
          <Tabs defaultValue="specs">
            <TabsList>
              <TabsTrigger value="specs">Характеристики</TabsTrigger>
              <TabsTrigger value="compat">Совместимость{compat.length ? ` (${compat.length})` : ""}</TabsTrigger>
              <TabsTrigger value="dom">DOM/DDM</TabsTrigger>
              <TabsTrigger value="docs">Документы</TabsTrigger>
            </TabsList>

            {/* характеристики */}
            <TabsContent value="specs" className="mt-4">
              <div className="max-w-2xl overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {specRows.map(([k, v], i) => (
                      <tr key={k} className={i % 2 ? "bg-subtle" : ""}>
                        <td className="w-1/2 px-4 py-2 text-muted-foreground">{k}</td>
                        <td className="mono px-4 py-2 font-medium">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* совместимость */}
            <TabsContent value="compat" className="mt-4">
              {compat.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет данных о протестированном оборудовании для этого модуля.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-subtle text-xs text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Вендор</th>
                        <th className="px-4 py-2 text-left font-medium">Модель</th>
                        <th className="px-4 py-2 text-left font-medium">Порт-группа</th>
                        <th className="px-4 py-2 text-left font-medium">Роль</th>
                        <th className="px-4 py-2 text-left font-medium">Мин. ПО</th>
                        <th className="px-4 py-2 text-left font-medium">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compat.map((c, i) => (
                        <tr key={i} className={i % 2 ? "bg-subtle" : ""}>
                          <td className="px-4 py-2">{c.vendor}</td>
                          <td className="mono px-4 py-2">{c.model}</td>
                          <td className="px-4 py-2 text-muted-foreground">{c.portGroup ?? "—"}</td>
                          <td className="px-4 py-2">{c.role === "primary" ? "Основной" : "Альтернатива"}</td>
                          <td className="mono px-4 py-2 text-muted-foreground">{c.minSoftwareVersion ?? "—"}</td>
                          <td className="px-4 py-2">
                            {c.tested ? (
                              <span className="inline-flex items-center gap-1 text-success"><Check className="h-3.5 w-3.5" /> протестировано</span>
                            ) : (
                              <span className="text-muted-foreground">заявлено</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* DOM/DDM */}
            <TabsContent value="dom" className="mt-4">
              {!product.domSupport ? (
                <p className="text-sm text-muted-foreground">Модуль не поддерживает цифровую диагностику (DOM/DDM).</p>
              ) : (
                <div className="max-w-2xl overflow-x-auto rounded-lg border border-border">
                  <table className="mono w-full text-sm">
                    <thead className="bg-subtle text-xs text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Параметр</th>
                        <th className="px-4 py-2 text-right font-medium">Low alarm</th>
                        <th className="px-4 py-2 text-right font-medium">Low warn</th>
                        <th className="px-4 py-2 text-right font-medium">High warn</th>
                        <th className="px-4 py-2 text-right font-medium">High alarm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DOM_THRESHOLDS.map((d, i) => (
                        <tr key={d.param} className={i % 2 ? "bg-subtle" : ""}>
                          <td className="px-4 py-2 font-medium">{d.param}, {d.unit}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{d.la}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{d.lw}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{d.hw}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{d.ha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* документы */}
            <TabsContent value="docs" className="mt-4">
              <div className="flex flex-wrap gap-3">
                {["Datasheet (PDF)", "Тест-отчёт", "Декларация соответствия"].map((d) => (
                  <span key={d} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" /> {d}
                  </span>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* аналоги */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-semibold">Аналоги и сопутствующие</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.sku} p={p as ProductCardData} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
