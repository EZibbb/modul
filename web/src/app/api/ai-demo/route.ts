import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Демо-«со-пилот»: детект сценария + ответ на реальных данных каталога.
// Структура ответа совместима с будущим Claude API (text + products + suggestions).

type AiProduct = {
  sku: string; name: string; formFactor: string; mediaType: string | null;
  reachM: number | null; wavelengthNm: number | null; connector: string | null;
  priceBase: number; pricePartner: number | null; oemPrice: number | null;
};

const sel = { sku: true, name: true, formFactor: true, mediaType: true, reachM: true, wavelengthNm: true, connector: true, priceBase: true, pricePartner: true, oemPrice: true } as const;

const FF_BY_SPEED: Record<number, string> = { 1: "SFP", 10: "SFP+", 25: "SFP28", 40: "QSFP+", 100: "QSFP28", 400: "QSFP-DD" };

export async function POST(request: Request) {
  const { message } = (await request.json().catch(() => ({}))) as { message?: string };
  const msg = (message ?? "").trim();
  const low = msg.toLowerCase();

  // — DOM-диагностика —
  if (/show\s+interface|rx\s*power|tx\s*power|dbm|трансивер.*(power|мощност)/i.test(msg)) {
    return NextResponse.json({
      text: "Похоже на вывод DOM. Откройте инструмент «Диагностика DOM» и вставьте полный вывод `show interface transceiver` — разберу Rx/Tx/ток/температуру по каждому порту и дам вердикт по порогам.",
      suggestions: ["Аналог Cisco SFP-10G-LR", "Соединить два ЦОД, 80 км, 100G"],
      cta: { label: "Открыть диагностику DOM", href: "/dom" },
    });
  }

  // — аналог OEM —
  if (/аналог|oem|замен|совместим.*(cisco|juniper|huawei|arista)|cisco|juniper|huawei|arista|mikrotik/i.test(low) && !/(\bцод\b|датацентр|магистрал|линию|линия|соедин)/i.test(low)) {
    const vendor = (low.match(/cisco|juniper|huawei|arista|mikrotik/i)?.[0] ?? "").replace(/^\w/, (c) => c.toUpperCase());
    const where = vendor ? { oemRef: { contains: vendor } } : { oemPrice: { not: null } };
    const rows = (await prisma.product.findMany({ where, select: sel, orderBy: { priceBase: "asc" }, take: 3 })) as AiProduct[];
    return NextResponse.json({
      text: rows.length
        ? `Подобрал совместимые аналоги${vendor ? ` для ${vendor}` : ""} с экономией к OEM. Все программируются под вендора на складе и тестируются на оборудовании.`
        : "Не нашёл прямой аналог по запросу — уточните вендора или артикул OEM.",
      products: rows,
      suggestions: ["Модули 25G для leaf-коммутатора", "Соединить два ЦОД, 80 км, 100G"],
    });
  }

  // — подбор решения по задаче —
  if (/\d+\s*(g|гбит)|\bцод\b|датацентр|магистрал|соедин|линию|линия|км|leaf|spine|uplink|доступ/i.test(low)) {
    const speed = Number(low.match(/(\d+)\s*(?:g|гбит)/i)?.[1]) || (/датацентр|\bцод\b|spine|leaf/i.test(low) ? 100 : 10);
    const km = Number(low.match(/(\d+)\s*км/i)?.[1]) || null;
    const ff = FF_BY_SPEED[speed] ?? "SFP+";
    const reachReq = km ? km * 1000 : null;
    const rows = (await prisma.product.findMany({
      where: { formFactor: ff, speedGbps: speed, ...(reachReq ? { reachM: { gte: reachReq } } : {}), mediaType: { notIn: ["copper", "AOC", "BiDi"] } },
      select: sel, orderBy: [{ reachM: "asc" }, { priceBase: "asc" }], take: 3,
    })) as AiProduct[];
    const reachText = km ? `на ${km} км` : "для коротких линков";
    return NextResponse.json({
      text: rows.length
        ? `Для линии ${speed}G ${reachText} подойдут модули ${ff}. Рекомендую основной + альтернативы по запасу/цене. Не забудьте патч-корды и проверку оптбюджета.`
        : `Под ${speed}G ${reachText} в текущем срезе каталога точного совпадения нет — посмотрите каталог ${ff} или уточните дальность.`,
      products: rows,
      suggestions: ["Рассчитать оптбюджет", "Аналог Cisco QSFP-100G-LR4", "Показать DAC для стойки"],
      cta: rows.length ? { label: "Рассчитать оптбюджет линии", href: "/calculator" } : { label: "Открыть каталог", href: `/catalog?cat=${ff === "SFP+" ? "sfp-plus" : ff === "SFP28" ? "sfp28" : ff === "QSFP28" ? "qsfp28" : ff === "QSFP-DD" ? "qsfp-dd" : ff === "QSFP+" ? "qsfp-plus" : "sfp"}` },
    });
  }

  // — приветствие / fallback —
  return NextResponse.json({
    text: "Я инженерный со-пилот Modul comp. Помогу подобрать модули под задачу, найти аналог OEM или разобрать DOM. Опишите задачу — например, «соединить два ЦОД, 80 км, 100G».",
    suggestions: ["Соединить два ЦОД, 80 км, 100G", "Аналог Cisco SFP-10G-LR", "Модули 25G для leaf-коммутатора", "Разобрать вывод DOM"],
  });
}
