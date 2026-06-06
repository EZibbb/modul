import { Sparkles, Network } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CopilotButton } from "@/components/copilot-button";
import { getVendorsCascade, getCompatForModel } from "@/lib/compat";
import { CompatCascade } from "./_components/compat-cascade";
import { CompatResult } from "./_components/compat-result";
import type { SearchParamsObj } from "@/lib/catalog-params";

export const dynamic = "force-dynamic";

export default async function CompatibilityPage({ searchParams }: { searchParams: Promise<SearchParamsObj> }) {
  const sp = await searchParams;
  const modelId = typeof sp.model === "string" ? sp.model : undefined;

  const [vendors, compat] = await Promise.all([
    getVendorsCascade(),
    modelId ? getCompatForModel(modelId) : Promise.resolve(null),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight">Подбор совместимости</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Выберите вендора и модель оборудования — подберём модули по каждой порт-группе.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <div>
            <div className="sticky top-20">
              <CompatCascade vendors={vendors} currentModelId={modelId} />
              <div className="mt-5 rounded-lg border border-dashed border-border p-3 text-sm">
                <div className="mb-1 flex items-center gap-1.5 font-medium"><Sparkles className="h-4 w-4 text-primary" /> Не нашли модель?</div>
                <p className="text-muted-foreground">Опишите задачу — ИИ-со-пилот подберёт комплект.</p>
                <CopilotButton seed="Не нашёл нужную модель оборудования — помоги подобрать совместимые модули" label="Спросить ИИ" size="sm" className="mt-2" />
              </div>
            </div>
          </div>

          <div>
            {compat ? (
              <CompatResult compat={compat} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
                <Network className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">Выберите модель оборудования слева,<br />чтобы увидеть совместимые модули по порт-группам.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
