import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AddToSpec } from "@/components/add-to-spec";
import { AddToCompare } from "@/components/add-to-compare";

export type ProductCardData = {
  sku: string;
  name: string;
  formFactor: string;
  speedGbps: number | null;
  mediaType: string | null;
  wavelengthNm: number | null;
  reachM: number | null;
  connector: string | null;
  tempRange: string | null;
  domSupport: boolean;
  priceBase: number;
  pricePartner: number | null;
  oemPrice: number | null;
  stockStatus: string;
  leadTimeDays: number | null;
};

const ru = (n: number) => n.toLocaleString("ru-RU");
const reach = (m: number | null) =>
  m == null ? null : m >= 1000 ? `${m / 1000} км` : `${m} м`;

export function ProductCard({ p }: { p: ProductCardData }) {
  const savings = p.oemPrice ? Math.round(((p.oemPrice - p.priceBase) / p.oemPrice) * 100) : null;
  const specs = [
    p.wavelengthNm ? `${p.wavelengthNm} нм` : null,
    reach(p.reachM),
    p.connector,
  ].filter(Boolean);

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* арт-плейсхолдер по форм-фактору (W04 — реальные SVG позже) */}
      <div className="relative flex h-32 items-center justify-center rounded-t-lg bg-gradient-to-br from-muted to-subtle">
        <span className="mono text-2xs rounded bg-card/80 px-2 py-1 text-muted-foreground">{p.formFactor}</span>
        <div className="absolute left-2 top-2">
          <AddToCompare item={p} iconOnly size="icon" variant="outline" className="h-7 w-7 bg-card/80" />
        </div>
        <div className="absolute right-2 top-2">
          {p.stockStatus === "in" ? (
            <Badge variant="outline" className="border-success/40 bg-success-muted text-success">в наличии</Badge>
          ) : (
            <Badge variant="outline" className="border-warning/40 bg-warning-muted text-warning">
              под заказ{p.leadTimeDays ? ` ${p.leadTimeDays} дн` : ""}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Link href={`/product/${p.sku}`} className="mono text-sm font-medium text-primary hover:underline">
            {p.sku}
          </Link>
          {p.domSupport && <span className="mono text-2xs rounded bg-muted px-1 py-0.5 text-muted-foreground">DOM</span>}
        </div>
        <h3 className="text-sm font-medium leading-snug">{p.name}</h3>

        {specs.length > 0 && (
          <div className="mono flex flex-wrap gap-x-3 gap-y-1 text-2xs text-muted-foreground">
            {specs.map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="mono text-base font-semibold">{ru(p.priceBase)}&nbsp;₽</div>
            {savings != null && savings > 0 && (
              <div className="text-2xs text-success">−{savings}% к OEM</div>
            )}
          </div>
          <AddToSpec item={{ sku: p.sku, name: p.name, priceBase: p.priceBase, pricePartner: p.pricePartner, oemPrice: p.oemPrice }} />
        </div>
      </div>
    </div>
  );
}
