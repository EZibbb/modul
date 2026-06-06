import { PiggyBank } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/db";
import { EconomyCalc } from "./_components/economy-calc";

export const dynamic = "force-dynamic";

export default async function EconomyPage() {
  const rows = await prisma.product.findMany({
    where: { oemPrice: { not: null } },
    select: { sku: true, name: true, priceBase: true, pricePartner: true, oemPrice: true, oemRef: true },
    orderBy: { priceBase: "asc" },
  });
  const products = rows.map((r) => ({ ...r, oemPrice: r.oemPrice ?? 0 }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <div className="mb-5 flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Калькулятор экономии vs OEM</h1>
        </div>
        <EconomyCalc products={products} />
      </main>
    </>
  );
}
