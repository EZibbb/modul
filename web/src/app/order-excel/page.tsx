import { FileSpreadsheet } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/db";
import { BomImport } from "./_components/bom-import";

export const dynamic = "force-dynamic";

export default async function OrderExcelPage() {
  const products = await prisma.product.findMany({
    select: { sku: true, name: true, priceBase: true, pricePartner: true, oemPrice: true },
    orderBy: { sku: "asc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <div className="mb-5 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Быстрый заказ по списку / Excel</h1>
        </div>
        <BomImport products={products} />
      </main>
    </>
  );
}
