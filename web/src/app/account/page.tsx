import Link from "next/link";
import { Check, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getAccountDashboard, getDemoCompanies } from "@/lib/account";
import { AccountBody } from "./_components/account-body";
import type { SearchParamsObj } from "@/lib/catalog-params";

export const dynamic = "force-dynamic";

function initials(name: string) {
  const core = name.replace(/(ООО|АО|ЗАО|ПАО|«|»)/g, "").trim();
  return (core.match(/[А-ЯA-Z]/g)?.slice(0, 2).join("") || core.slice(0, 2)).toUpperCase();
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<SearchParamsObj> }) {
  const sp = await searchParams;
  const companyId = typeof sp.company === "string" ? sp.company : undefined;
  const [companies, data] = await Promise.all([getDemoCompanies(), getAccountDashboard(companyId)]);

  if (!data) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-[1320px] px-6 py-16 text-center text-muted-foreground">Нет демо-аккаунтов.</main>
      </>
    );
  }

  const { company } = data;
  const isPartner = company.priceTier === "partner";
  const subline = [
    isPartner ? "Партнёр" : "Клиент",
    isPartner && company.discountPct ? `скидка ${company.discountPct}%` : null,
    company.manager ? `менеджер ${company.manager.name}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <>
      <SiteHeader />

      {/* шапка-карточка компании */}
      <div className="page-head relative overflow-hidden">
        <div className="hero-grid" />
        <div className="hero-glow" style={{ width: 380, height: 230, top: -120, right: "6%", background: "rgba(37,99,235,.20)" }} />
        <div className="pointer-events-none absolute inset-0"><div className="fiber-line" style={{ top: "60%" }}><span className="pulse" style={{ "--d": "9s" } as React.CSSProperties} /></div></div>
        <div className="relative mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-6 py-7">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#0891b2] text-base font-semibold text-white">{initials(company.name)}</span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">{company.name}</h1>
              <p className="text-sm text-slate-400">{subline}</p>
              {company.manager && (
                <p className="mono mt-0.5 flex items-center gap-1.5 text-2xs text-slate-400">
                  <Phone className="h-3 w-3" /> {company.manager.phone} · {company.manager.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isPartner && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                <Check className="h-3.5 w-3.5" /> Партнёрский статус активен
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-slate-400">демо-клиент:</span>
              {companies.map((c) => (
                <Link
                  key={c.id}
                  href={`/account?company=${c.id}`}
                  className={`rounded-md border px-2 py-1 text-2xs ${c.name === company.name ? "border-primary bg-primary text-primary-foreground" : "border-white/15 text-slate-300 hover:bg-white/10"}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1320px] px-6 py-6">
        <AccountBody data={data} />
      </main>
    </>
  );
}
