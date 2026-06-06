// Deterministic seed (W03) — каталог K (данные) + матрица совместимости B.
// Запуск: npm run db:seed  (npx tsx prisma/seed.ts)
// ~90 товаров по 9 категориям + детерминированная матрица совместимости.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// — ценовые помощники (детерминированно) —
const pp = (b: number) => Math.round((b * 0.87) / 10) * 10; // партнёрская
const oem = (b: number, m: number) => Math.round((b * m) / 10000) * 100; // OEM-аналог: base × (m/100), округл. до сотен

const FW = ["Generic", "Cisco", "Juniper", "Huawei", "Arista", "MikroTik"];
const CERT = ["CE", "FCC", "RoHS", "MSA"];

async function main() {
  // — чистим (идемпотентность) —
  await prisma.favorite.deleteMany();
  await prisma.savedConfig.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.compatibility.deleteMany();
  await prisma.portGroup.deleteMany();
  await prisma.deviceModel.deleteMany();
  await prisma.deviceSeries.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attributeDefinition.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // — атрибуты-фасеты (A строит фильтры из этого) —
  const txCats = ["sfp", "sfp-plus", "sfp28", "qsfp-plus", "qsfp28", "qsfp-dd"];
  await prisma.attributeDefinition.createMany({
    data: [
      { key: "speedGbps", label: "Скорость", unit: "G", type: "enum", filterUi: "checkbox", position: 1, categoryKeys: txCats },
      { key: "mediaType", label: "Тип среды / стандарт", type: "enum", filterUi: "checkbox", position: 2, categoryKeys: txCats },
      { key: "reachM", label: "Дальность", unit: "м", type: "range", filterUi: "range", position: 3, categoryKeys: txCats },
      { key: "wavelengthNm", label: "Длина волны", unit: "нм", type: "enum", filterUi: "checkbox", position: 4, categoryKeys: txCats },
      { key: "connector", label: "Разъём", type: "enum", filterUi: "checkbox", position: 5, categoryKeys: [...txCats, "patch"] },
      { key: "tempRange", label: "Температурный диапазон", type: "enum", filterUi: "select", position: 6, categoryKeys: txCats },
      { key: "domSupport", label: "Поддержка DOM", type: "bool", filterUi: "checkbox", position: 7, categoryKeys: txCats },
    ],
  });

  // — дерево категорий —
  const tx = await prisma.category.create({ data: { name: "Трансиверы и модули", slug: "transceivers", position: 1 } });
  const txKeys = ["speedGbps", "mediaType", "reachM", "wavelengthNm", "connector", "tempRange", "domSupport"];
  const mkCat = (name: string, slug: string, formFactor: string, position: number) =>
    prisma.category.create({ data: { name, slug, formFactor, parentId: tx.id, position, attributeKeys: txKeys } });

  const cSfp = await mkCat("SFP (1G)", "sfp", "SFP", 1);
  const cSfpPlus = await mkCat("SFP+ (10G)", "sfp-plus", "SFP+", 2);
  const cSfp28 = await mkCat("SFP28 (25G)", "sfp28", "SFP28", 3);
  const cQsfpPlus = await mkCat("QSFP+ (40G)", "qsfp-plus", "QSFP+", 4);
  const cQsfp28 = await mkCat("QSFP28 (100G)", "qsfp28", "QSFP28", 5);
  const cQsfpDd = await mkCat("QSFP-DD (400G)", "qsfp-dd", "QSFP-DD", 6);
  const cDac = await prisma.category.create({ data: { name: "DAC / AOC кабели", slug: "dac-aoc", position: 2 } });
  const cPatch = await prisma.category.create({ data: { name: "Патч-корды и кабели", slug: "patch", position: 3 } });
  const cWdm = await prisma.category.create({ data: { name: "CWDM / DWDM решения", slug: "wdm", position: 4 } });

  const brand = await prisma.brand.create({ data: { name: "Modul comp (compatible)" } });

  // — конструктор товара (общие дефолты + специфика) —
  type PO = Record<string, unknown> & { priceBase: number };
  const P = (categoryId: string, formFactor: string, o: PO) => ({
    categoryId,
    formFactor,
    brandId: brand.id,
    firmwareOptions: FW,
    certifications: CERT,
    images: [],
    documents: [],
    attributes: {},
    tempRange: "com",
    domSupport: true,
    stockStatus: "in",
    leadTimeDays: 0,
    pricePartner: pp(o.priceBase),
    ...o,
  });

  const products: Record<string, unknown>[] = [
    // ——— SFP 1G ———
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-SX", mpn: "GLC-SX-MMD", name: "SFP 1000BASE-SX 850nm 550m LC DOM", speedGbps: 1, mediaType: "SR", reachM: 550, wavelengthNm: 850, connector: "LC", laserType: "VCSEL", priceBase: 900, oemPrice: oem(900, 380), oemRef: "Cisco GLC-SX-MMD" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-LX", mpn: "GLC-LH-SMD", name: "SFP 1000BASE-LX 1310nm 10km LC DOM", speedGbps: 1, mediaType: "LR", reachM: 10000, wavelengthNm: 1310, connector: "LC", laserType: "FP", priceBase: 1100, oemPrice: oem(1100, 360), oemRef: "Cisco GLC-LH-SMD" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-EX", mpn: "GLC-EX-SMD", name: "SFP 1000BASE-EX 1310nm 40km LC DOM", speedGbps: 1, mediaType: "ER", reachM: 40000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 2600, oemPrice: oem(2600, 340), oemRef: "Cisco GLC-EX-SMD" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-ZX", mpn: "GLC-ZX-SMD", name: "SFP 1000BASE-ZX 1550nm 80km LC DOM", speedGbps: 1, mediaType: "ZR", reachM: 80000, wavelengthNm: 1550, connector: "LC", laserType: "DFB", priceBase: 3400, oemPrice: oem(3400, 330), oemRef: "Cisco GLC-ZX-SMD" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-T", mpn: "GLC-TE", name: "SFP 1000BASE-T RJ45 100m", speedGbps: 1, mediaType: "T", reachM: 100, connector: "RJ45", domSupport: false, priceBase: 1200, oemPrice: oem(1200, 350), oemRef: "Cisco GLC-TE" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-BX-U", mpn: "GLC-BX-U", name: "SFP 1000BASE-BX-U Tx1310/Rx1490 10km LC", speedGbps: 1, mediaType: "BiDi", reachM: 10000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 1500, oemPrice: oem(1500, 340), oemRef: "Cisco GLC-BX-U" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-BX-D", mpn: "GLC-BX-D", name: "SFP 1000BASE-BX-D Tx1490/Rx1310 10km LC", speedGbps: 1, mediaType: "BiDi", reachM: 10000, wavelengthNm: 1490, connector: "LC", laserType: "DFB", priceBase: 1500, oemPrice: oem(1500, 340), oemRef: "Cisco GLC-BX-D" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-CW1471", mpn: "CWDM-SFP-1471", name: "SFP 1G CWDM 1471nm 80km LC DOM", speedGbps: 1, mediaType: "CWDM", reachM: 80000, wavelengthNm: 1471, connector: "LC", laserType: "DFB", priceBase: 3100, oemPrice: oem(3100, 360), oemRef: "Cisco CWDM-SFP-1471" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-CW1491", mpn: "CWDM-SFP-1491", name: "SFP 1G CWDM 1491nm 80km LC DOM", speedGbps: 1, mediaType: "CWDM", reachM: 80000, wavelengthNm: 1491, connector: "LC", laserType: "DFB", priceBase: 3100, oemPrice: oem(3100, 360), oemRef: "Cisco CWDM-SFP-1491" }),
    P(cSfp.id, "SFP", { sku: "MC-SFP1G-CW1531", mpn: "CWDM-SFP-1531", name: "SFP 1G CWDM 1531nm 80km LC DOM", speedGbps: 1, mediaType: "CWDM", reachM: 80000, wavelengthNm: 1531, connector: "LC", laserType: "DFB", priceBase: 3100, oemPrice: oem(3100, 360), oemRef: "Cisco CWDM-SFP-1531" }),

    // ——— SFP+ 10G ———
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-SR", mpn: "SFP-10G-SR", name: "SFP+ 10GBASE-SR 850nm 300m LC DOM", speedGbps: 10, mediaType: "SR", reachM: 300, wavelengthNm: 850, connector: "LC", laserType: "VCSEL", priceBase: 1700, oemPrice: oem(1700, 365), oemRef: "Cisco SFP-10G-SR" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-LR", mpn: "SFP-10G-LR", name: "SFP+ 10GBASE-LR 1310nm 10km LC DOM", speedGbps: 10, mediaType: "LR", reachM: 10000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 2900, oemPrice: oem(2900, 314), oemRef: "Cisco SFP-10G-LR" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-ER", mpn: "SFP-10G-ER", name: "SFP+ 10GBASE-ER 1550nm 40km LC DOM", speedGbps: 10, mediaType: "ER", reachM: 40000, wavelengthNm: 1550, connector: "LC", laserType: "DFB", priceBase: 7400, oemPrice: oem(7400, 284), oemRef: "Cisco SFP-10G-ER", stockStatus: "order", leadTimeDays: 7 }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-ZR", mpn: "SFP-10G-ZR", name: "SFP+ 10GBASE-ZR 1550nm 80km LC DOM", speedGbps: 10, mediaType: "ZR", reachM: 80000, wavelengthNm: 1550, connector: "LC", laserType: "DFB", priceBase: 11900, oemPrice: oem(11900, 270), oemRef: "Cisco SFP-10G-ZR", stockStatus: "order", leadTimeDays: 10 }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-LRM", mpn: "SFP-10G-LRM", name: "SFP+ 10GBASE-LRM 1310nm 220m LC DOM", speedGbps: 10, mediaType: "LRM", reachM: 220, wavelengthNm: 1310, connector: "LC", laserType: "FP", priceBase: 3200, oemPrice: oem(3200, 300), oemRef: "Cisco SFP-10G-LRM" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-LR-I", mpn: "SFP-10G-LR-I", name: "SFP+ 10GBASE-LR 1310nm 10km LC DOM Industrial -40..+85C", speedGbps: 10, mediaType: "LR", reachM: 10000, wavelengthNm: 1310, connector: "LC", tempRange: "ind", laserType: "DFB", priceBase: 4200, oemPrice: oem(4200, 345), oemRef: "Cisco SFP-10G-LR=" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-T", mpn: "SFP-10G-T-S", name: "SFP+ 10GBASE-T RJ45 30m", speedGbps: 10, mediaType: "T", reachM: 30, connector: "RJ45", domSupport: false, priceBase: 4800, oemPrice: oem(4800, 290), oemRef: "Cisco SFP-10G-T-S" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-BX-U", mpn: "SFP-10G-BXU-I", name: "SFP+ 10G BiDi-U Tx1270/Rx1330 10km LC DOM", speedGbps: 10, mediaType: "BiDi", reachM: 10000, wavelengthNm: 1270, connector: "LC", laserType: "DFB", priceBase: 5200, oemPrice: oem(5200, 300), oemRef: "Cisco SFP-10G-BXU" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-BX-D", mpn: "SFP-10G-BXD-I", name: "SFP+ 10G BiDi-D Tx1330/Rx1270 10km LC DOM", speedGbps: 10, mediaType: "BiDi", reachM: 10000, wavelengthNm: 1330, connector: "LC", laserType: "DFB", priceBase: 5200, oemPrice: oem(5200, 300), oemRef: "Cisco SFP-10G-BXD" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-CW1471", mpn: "CWDM-SFP10G-1471", name: "SFP+ 10G CWDM 1471nm 40km LC DOM", speedGbps: 10, mediaType: "CWDM", reachM: 40000, wavelengthNm: 1471, connector: "LC", laserType: "DFB", priceBase: 6300, oemPrice: oem(6300, 320), oemRef: "Cisco CWDM-SFP10G-1471" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-CW1531", mpn: "CWDM-SFP10G-1531", name: "SFP+ 10G CWDM 1531nm 40km LC DOM", speedGbps: 10, mediaType: "CWDM", reachM: 40000, wavelengthNm: 1531, connector: "LC", laserType: "DFB", priceBase: 6300, oemPrice: oem(6300, 320), oemRef: "Cisco CWDM-SFP10G-1531" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-CW1491", mpn: "CWDM-SFP10G-1491", name: "SFP+ 10G CWDM 1491nm 40km LC DOM", speedGbps: 10, mediaType: "CWDM", reachM: 40000, wavelengthNm: 1491, connector: "LC", laserType: "DFB", priceBase: 6300, oemPrice: oem(6300, 320), oemRef: "Cisco CWDM-SFP10G-1491" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-CW1511", mpn: "CWDM-SFP10G-1511", name: "SFP+ 10G CWDM 1511nm 40km LC DOM", speedGbps: 10, mediaType: "CWDM", reachM: 40000, wavelengthNm: 1511, connector: "LC", laserType: "DFB", priceBase: 6300, oemPrice: oem(6300, 320), oemRef: "Cisco CWDM-SFP10G-1511" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-CW1551", mpn: "CWDM-SFP10G-1551", name: "SFP+ 10G CWDM 1551nm 40km LC DOM", speedGbps: 10, mediaType: "CWDM", reachM: 40000, wavelengthNm: 1551, connector: "LC", laserType: "DFB", priceBase: 6300, oemPrice: oem(6300, 320), oemRef: "Cisco CWDM-SFP10G-1551" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-CW1571", mpn: "CWDM-SFP10G-1571", name: "SFP+ 10G CWDM 1571nm 40km LC DOM", speedGbps: 10, mediaType: "CWDM", reachM: 40000, wavelengthNm: 1571, connector: "LC", laserType: "DFB", priceBase: 6500, oemPrice: oem(6500, 320), oemRef: "Cisco CWDM-SFP10G-1571" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-CW1591", mpn: "CWDM-SFP10G-1591", name: "SFP+ 10G CWDM 1591nm 40km LC DOM", speedGbps: 10, mediaType: "CWDM", reachM: 40000, wavelengthNm: 1591, connector: "LC", laserType: "DFB", priceBase: 6500, oemPrice: oem(6500, 320), oemRef: "Cisco CWDM-SFP10G-1591" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-CW1611", mpn: "CWDM-SFP10G-1611", name: "SFP+ 10G CWDM 1611nm 40km LC DOM", speedGbps: 10, mediaType: "CWDM", reachM: 40000, wavelengthNm: 1611, connector: "LC", laserType: "DFB", priceBase: 6500, oemPrice: oem(6500, 320), oemRef: "Cisco CWDM-SFP10G-1611" }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-DW-C32", mpn: "DWDM-SFP10G-C32", name: "SFP+ 10G DWDM C32 1551.72nm 80km LC DOM", speedGbps: 10, mediaType: "DWDM", reachM: 80000, wavelengthNm: 1551, dwdmChannel: "C32", connector: "LC", laserType: "DFB", priceBase: 12500, oemPrice: oem(12500, 280), oemRef: "Cisco DWDM-SFP10G-51.72", stockStatus: "order", leadTimeDays: 14 }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-DW-C34", mpn: "DWDM-SFP10G-C34", name: "SFP+ 10G DWDM C34 1550.12nm 80km LC DOM", speedGbps: 10, mediaType: "DWDM", reachM: 80000, wavelengthNm: 1550, dwdmChannel: "C34", connector: "LC", laserType: "DFB", priceBase: 12500, oemPrice: oem(12500, 280), oemRef: "Cisco DWDM-SFP10G-50.12", stockStatus: "order", leadTimeDays: 14 }),
    P(cSfpPlus.id, "SFP+", { sku: "MC-SFP10G-DW-C36", mpn: "DWDM-SFP10G-C36", name: "SFP+ 10G DWDM C36 1548.51nm 80km LC DOM", speedGbps: 10, mediaType: "DWDM", reachM: 80000, wavelengthNm: 1548, dwdmChannel: "C36", connector: "LC", laserType: "DFB", priceBase: 12500, oemPrice: oem(12500, 280), oemRef: "Cisco DWDM-SFP10G-48.51", stockStatus: "order", leadTimeDays: 14 }),

    // ——— SFP28 25G ———
    P(cSfp28.id, "SFP28", { sku: "MC-SFP25G-SR", mpn: "SFP-25G-SR-S", name: "SFP28 25GBASE-SR 850nm 100m LC DOM", speedGbps: 25, mediaType: "SR", reachM: 100, wavelengthNm: 850, connector: "LC", laserType: "VCSEL", priceBase: 3900, oemPrice: oem(3900, 330), oemRef: "Cisco SFP-25G-SR-S" }),
    P(cSfp28.id, "SFP28", { sku: "MC-SFP25G-LR", mpn: "SFP-25G-LR-S", name: "SFP28 25GBASE-LR 1310nm 10km LC DOM", speedGbps: 25, mediaType: "LR", reachM: 10000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 6100, oemPrice: oem(6100, 308), oemRef: "Cisco SFP-25G-LR-S" }),
    P(cSfp28.id, "SFP28", { sku: "MC-SFP25G-ER", mpn: "SFP-25G-ER-S", name: "SFP28 25GBASE-ER 1310nm 30km LC DOM", speedGbps: 25, mediaType: "ER", reachM: 30000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 13800, oemPrice: oem(13800, 270), oemRef: "Cisco SFP-25G-ER-S", stockStatus: "order", leadTimeDays: 10 }),
    P(cSfp28.id, "SFP28", { sku: "MC-SFP25G-ESR", mpn: "SFP-25G-ESR", name: "SFP28 25GBASE-ESR 850nm 300m LC DOM", speedGbps: 25, mediaType: "SR", reachM: 300, wavelengthNm: 850, connector: "LC", laserType: "VCSEL", priceBase: 5200, oemPrice: oem(5200, 320), oemRef: "Cisco SFP-25G-ESR" }),
    P(cSfp28.id, "SFP28", { sku: "MC-SFP25G-LR-I", mpn: "SFP-25G-LR-I", name: "SFP28 25GBASE-LR 1310nm 10km LC DOM Industrial", speedGbps: 25, mediaType: "LR", reachM: 10000, wavelengthNm: 1310, connector: "LC", tempRange: "ind", laserType: "DFB", priceBase: 8400, oemPrice: oem(8400, 320), oemRef: "Cisco SFP-25G-LR-I" }),

    // ——— QSFP+ 40G ———
    P(cQsfpPlus.id, "QSFP+", { sku: "MC-QSFP40G-SR4", mpn: "QSFP-40G-SR4", name: "QSFP+ 40GBASE-SR4 850nm 150m MPO DOM", speedGbps: 40, mediaType: "SR4", reachM: 150, wavelengthNm: 850, connector: "MPO", laserType: "VCSEL", priceBase: 4900, oemPrice: oem(4900, 340), oemRef: "Cisco QSFP-40G-SR4" }),
    P(cQsfpPlus.id, "QSFP+", { sku: "MC-QSFP40G-LR4", mpn: "QSFP-40G-LR4", name: "QSFP+ 40GBASE-LR4 1310nm 10km LC DOM", speedGbps: 40, mediaType: "LR4", reachM: 10000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 9800, oemPrice: oem(9800, 300), oemRef: "Cisco QSFP-40G-LR4" }),
    P(cQsfpPlus.id, "QSFP+", { sku: "MC-QSFP40G-ER4", mpn: "QSFP-40G-ER4", name: "QSFP+ 40GBASE-ER4 1310nm 40km LC DOM", speedGbps: 40, mediaType: "ER4", reachM: 40000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 21000, oemPrice: oem(21000, 250), oemRef: "Cisco QSFP-40G-ER4", stockStatus: "order", leadTimeDays: 14 }),
    P(cQsfpPlus.id, "QSFP+", { sku: "MC-QSFP40G-ESR4", mpn: "QSFP-40G-ESR4", name: "QSFP+ 40GBASE-ESR4 850nm 400m MPO DOM", speedGbps: 40, mediaType: "SR4", reachM: 400, wavelengthNm: 850, connector: "MPO", laserType: "VCSEL", priceBase: 7600, oemPrice: oem(7600, 320), oemRef: "Cisco QSFP-40G-ESR4" }),
    P(cQsfpPlus.id, "QSFP+", { sku: "MC-QSFP40G-PLR4", mpn: "QSFP-40G-PLR4", name: "QSFP+ 40G PLR4 1310nm 10km MPO (4x10G breakout)", speedGbps: 40, mediaType: "LR4", reachM: 10000, wavelengthNm: 1310, connector: "MPO", laserType: "DFB", priceBase: 11200, oemPrice: oem(11200, 290), oemRef: "Cisco QSFP-4x10G-LR-S" }),
    P(cQsfpPlus.id, "QSFP+", { sku: "MC-QSFP40G-BIDI", mpn: "QSFP-40G-SR-BD", name: "QSFP+ 40G BiDi 850/900nm 100m LC DOM", speedGbps: 40, mediaType: "BiDi", reachM: 100, wavelengthNm: 850, connector: "LC", laserType: "VCSEL", priceBase: 8900, oemPrice: oem(8900, 310), oemRef: "Cisco QSFP-40G-SR-BD" }),

    // ——— QSFP28 100G ———
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-SR4", mpn: "QSFP-100G-SR4", name: "QSFP28 100GBASE-SR4 850nm 100m MPO DOM", speedGbps: 100, mediaType: "SR4", reachM: 100, wavelengthNm: 850, connector: "MPO", laserType: "VCSEL", priceBase: 12800, oemPrice: oem(12800, 320), oemRef: "Cisco QSFP-100G-SR4-S" }),
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-LR4", mpn: "QSFP-100G-LR4", name: "QSFP28 100GBASE-LR4 CWDM4 10km LC DOM", speedGbps: 100, mediaType: "LR4", reachM: 10000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 22500, oemPrice: oem(22500, 347), oemRef: "Cisco QSFP-100G-LR4-S", stockStatus: "order", leadTimeDays: 10 }),
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-CWDM4", mpn: "QSFP-100G-CWDM4", name: "QSFP28 100G CWDM4 1310nm 2km LC DOM", speedGbps: 100, mediaType: "CWDM4", reachM: 2000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 15400, oemPrice: oem(15400, 300), oemRef: "Cisco QSFP-100G-CWDM4-S" }),
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-PSM4", mpn: "QSFP-100G-PSM4", name: "QSFP28 100G PSM4 1310nm 500m MPO DOM", speedGbps: 100, mediaType: "PSM4", reachM: 500, wavelengthNm: 1310, connector: "MPO", laserType: "DFB", priceBase: 14200, oemPrice: oem(14200, 300), oemRef: "Cisco QSFP-100G-PSM4-S" }),
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-ER4L", mpn: "QSFP-100G-ER4L", name: "QSFP28 100G ER4 Lite 1310nm 40km LC DOM", speedGbps: 100, mediaType: "ER4", reachM: 40000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 38000, oemPrice: oem(38000, 250), oemRef: "Cisco QSFP-100G-ER4L-S", stockStatus: "order", leadTimeDays: 21 }),
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-BIDI", mpn: "QSFP-100G-SR-BD", name: "QSFP28 100G BiDi 850/900nm 100m LC DOM", speedGbps: 100, mediaType: "BiDi", reachM: 100, wavelengthNm: 850, connector: "LC", laserType: "VCSEL", priceBase: 17800, oemPrice: oem(17800, 300), oemRef: "Cisco QSFP-100G-SR-BD" }),
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-LR4-I", mpn: "QSFP-100G-LR4-I", name: "QSFP28 100G LR4 1310nm 10km LC DOM Industrial", speedGbps: 100, mediaType: "LR4", reachM: 10000, wavelengthNm: 1310, connector: "LC", tempRange: "ind", laserType: "DFB", priceBase: 31000, oemPrice: oem(31000, 280), oemRef: "Cisco QSFP-100G-LR4-I", stockStatus: "order", leadTimeDays: 14 }),
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-4WDM10", mpn: "QSFP-100G-4WDM-10", name: "QSFP28 100G 4WDM-10 1310nm 10km LC DOM", speedGbps: 100, mediaType: "LR4", reachM: 10000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 19800, oemPrice: oem(19800, 300), oemRef: "Cisco QSFP-100G-4WDM-10-S" }),
    P(cQsfp28.id, "QSFP28", { sku: "MC-QSFP100G-ZR4", mpn: "QSFP-100G-ZR4", name: "QSFP28 100G ZR4 1550nm 80km LC DOM", speedGbps: 100, mediaType: "ZR4", reachM: 80000, wavelengthNm: 1550, connector: "LC", laserType: "DFB", priceBase: 62000, oemPrice: oem(62000, 240), oemRef: "Cisco QSFP-100G-ZR4-S", stockStatus: "order", leadTimeDays: 28 }),

    // ——— QSFP-DD 400G ———
    P(cQsfpDd.id, "QSFP-DD", { sku: "MC-QSFPDD400G-DR4", mpn: "QDD-400G-DR4", name: "QSFP-DD 400GBASE-DR4 1310nm 500m MPO-12 DOM", speedGbps: 400, mediaType: "DR4", reachM: 500, wavelengthNm: 1310, connector: "MPO", laserType: "DFB", priceBase: 58000, oemPrice: oem(58000, 240), oemRef: "Cisco QDD-400G-DR4-S", stockStatus: "order", leadTimeDays: 14 }),
    P(cQsfpDd.id, "QSFP-DD", { sku: "MC-QSFPDD400G-FR4", mpn: "QDD-400G-FR4", name: "QSFP-DD 400GBASE-FR4 1310nm 2km LC DOM", speedGbps: 400, mediaType: "FR4", reachM: 2000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 72000, oemPrice: oem(72000, 235), oemRef: "Cisco QDD-400G-FR4-S", stockStatus: "order", leadTimeDays: 21 }),
    P(cQsfpDd.id, "QSFP-DD", { sku: "MC-QSFPDD400G-LR4", mpn: "QDD-400G-LR4", name: "QSFP-DD 400GBASE-LR4 1310nm 10km LC DOM", speedGbps: 400, mediaType: "LR4", reachM: 10000, wavelengthNm: 1310, connector: "LC", laserType: "DFB", priceBase: 98000, oemPrice: oem(98000, 230), oemRef: "Cisco QDD-400G-LR4-S", stockStatus: "order", leadTimeDays: 28 }),
    P(cQsfpDd.id, "QSFP-DD", { sku: "MC-QSFPDD400G-SR8", mpn: "QDD-400G-SR8", name: "QSFP-DD 400GBASE-SR8 850nm 100m MPO-16 DOM", speedGbps: 400, mediaType: "SR8", reachM: 100, wavelengthNm: 850, connector: "MPO", laserType: "VCSEL", priceBase: 49000, oemPrice: oem(49000, 250), oemRef: "Cisco QDD-400G-SR8-S", stockStatus: "order", leadTimeDays: 14 }),

    // ——— DAC / AOC ———
    P(cDac.id, "SFP+", { sku: "MC-SFP10G-DAC1", mpn: "SFP-H10GB-CU1M", name: "SFP+ 10G DAC пассивный 1м", speedGbps: 10, mediaType: "copper", reachM: 1, connector: "SFP+", domSupport: false, priceBase: 950, oemPrice: oem(950, 360), oemRef: "Cisco SFP-H10GB-CU1M" }),
    P(cDac.id, "SFP+", { sku: "MC-SFP10G-DAC3", mpn: "SFP-H10GB-CU3M", name: "SFP+ 10G DAC пассивный 3м", speedGbps: 10, mediaType: "copper", reachM: 3, connector: "SFP+", domSupport: false, priceBase: 1250, oemPrice: oem(1250, 360), oemRef: "Cisco SFP-H10GB-CU3M" }),
    P(cDac.id, "SFP28", { sku: "MC-SFP25G-DAC1", mpn: "SFP-H25G-CU1M", name: "SFP28 25G DAC пассивный 1м", speedGbps: 25, mediaType: "copper", reachM: 1, connector: "SFP28", domSupport: false, priceBase: 1600, oemPrice: oem(1600, 340), oemRef: "Cisco SFP-H25G-CU1M" }),
    P(cDac.id, "SFP28", { sku: "MC-SFP25G-DAC3", mpn: "SFP-H25G-CU3M", name: "SFP28 25G DAC пассивный 3м", speedGbps: 25, mediaType: "copper", reachM: 3, connector: "SFP28", domSupport: false, priceBase: 2100, oemPrice: oem(2100, 340), oemRef: "Cisco SFP-H25G-CU3M" }),
    P(cDac.id, "QSFP+", { sku: "MC-QSFP40G-DAC1", mpn: "QSFP-H40G-CU1M", name: "QSFP+ 40G DAC пассивный 1м", speedGbps: 40, mediaType: "copper", reachM: 1, connector: "QSFP+", domSupport: false, priceBase: 2400, oemPrice: oem(2400, 330), oemRef: "Cisco QSFP-H40G-CU1M" }),
    P(cDac.id, "QSFP+", { sku: "MC-QSFP40G-DAC3", mpn: "QSFP-H40G-CU3M", name: "QSFP+ 40G DAC пассивный 3м", speedGbps: 40, mediaType: "copper", reachM: 3, connector: "QSFP+", domSupport: false, priceBase: 3100, oemPrice: oem(3100, 330), oemRef: "Cisco QSFP-H40G-CU3M" }),
    P(cDac.id, "QSFP28", { sku: "MC-QSFP100G-DAC1", mpn: "QSFP-100G-CU1M", name: "QSFP28 100G DAC пассивный 1м", speedGbps: 100, mediaType: "copper", reachM: 1, connector: "QSFP28", domSupport: false, priceBase: 4600, oemPrice: oem(4600, 330), oemRef: "Cisco QSFP-100G-CU1M" }),
    P(cDac.id, "QSFP28", { sku: "MC-QSFP100G-DAC3", mpn: "QSFP-100G-CU3M", name: "QSFP28 100G DAC пассивный 3м", speedGbps: 100, mediaType: "copper", reachM: 3, connector: "QSFP28", domSupport: false, priceBase: 5400, oemPrice: oem(5400, 296), oemRef: "Cisco QSFP-100G-CU3M" }),
    P(cDac.id, "QSFP-DD", { sku: "MC-QSFPDD400G-DAC1", mpn: "QDD-400-CU1M", name: "QSFP-DD 400G DAC пассивный 1м", speedGbps: 400, mediaType: "copper", reachM: 1, connector: "QSFP-DD", domSupport: false, priceBase: 12800, oemPrice: oem(12800, 280), oemRef: "Cisco QDD-400-CU1M" }),
    P(cDac.id, "SFP+", { sku: "MC-SFP10G-AOC5", mpn: "SFP-10G-AOC5M", name: "SFP+ 10G AOC активный 5м", speedGbps: 10, mediaType: "AOC", reachM: 5, connector: "SFP+", domSupport: false, priceBase: 2200, oemPrice: oem(2200, 330), oemRef: "Cisco SFP-10G-AOC5M" }),
    P(cDac.id, "SFP28", { sku: "MC-SFP25G-AOC5", mpn: "SFP-25G-AOC5M", name: "SFP28 25G AOC активный 5м", speedGbps: 25, mediaType: "AOC", reachM: 5, connector: "SFP28", domSupport: false, priceBase: 3300, oemPrice: oem(3300, 320), oemRef: "Cisco SFP-25G-AOC5M" }),
    P(cDac.id, "QSFP28", { sku: "MC-QSFP100G-DAC2", mpn: "QSFP-100G-CU2M", name: "QSFP28 100G DAC пассивный 2м", speedGbps: 100, mediaType: "copper", reachM: 2, connector: "QSFP28", domSupport: false, priceBase: 5000, oemPrice: oem(5000, 300), oemRef: "Cisco QSFP-100G-CU2M" }),
    P(cDac.id, "QSFP28", { sku: "MC-QSFP100G-AOC7", mpn: "QSFP-100G-AOC7M", name: "QSFP28 100G AOC активный 7м", speedGbps: 100, mediaType: "AOC", reachM: 7, connector: "QSFP28", domSupport: false, priceBase: 9800, oemPrice: oem(9800, 300), oemRef: "Cisco QSFP-100G-AOC7M" }),
    P(cDac.id, "QSFP+", { sku: "MC-QSFP40G-AOC10", mpn: "QSFP-40G-AOC10M", name: "QSFP+ 40G AOC активный 10м", speedGbps: 40, mediaType: "AOC", reachM: 10, connector: "QSFP+", domSupport: false, priceBase: 6200, oemPrice: oem(6200, 310), oemRef: "Cisco QSFP-40G-AOC10M" }),
    P(cDac.id, "QSFP-DD", { sku: "MC-QSFPDD400G-AOC10", mpn: "QDD-400G-AOC10M", name: "QSFP-DD 400G AOC активный 10м", speedGbps: 400, mediaType: "AOC", reachM: 10, connector: "QSFP-DD", domSupport: false, priceBase: 34000, oemPrice: oem(34000, 250), oemRef: "Cisco QDD-400G-AOC10M", stockStatus: "order", leadTimeDays: 14 }),

    // ——— Патч-корды ———
    P(cPatch.id, "patch", { sku: "MC-PC-LCLC-SM-3", name: "Патч-корд LC-LC SM 9/125 OS2 duplex 3м", mediaType: "SMF", reachM: 3, connector: "LC", domSupport: false, priceBase: 260, fiberType: "OS2" }),
    P(cPatch.id, "patch", { sku: "MC-PC-LCLC-SM-5", name: "Патч-корд LC-LC SM 9/125 OS2 duplex 5м", mediaType: "SMF", reachM: 5, connector: "LC", domSupport: false, priceBase: 320, fiberType: "OS2" }),
    P(cPatch.id, "patch", { sku: "MC-PC-LCLC-SM-10", name: "Патч-корд LC-LC SM 9/125 OS2 duplex 10м", mediaType: "SMF", reachM: 10, connector: "LC", domSupport: false, priceBase: 440, fiberType: "OS2" }),
    P(cPatch.id, "patch", { sku: "MC-PC-LCLC-OM4-3", name: "Патч-корд LC-LC MM 50/125 OM4 duplex 3м", mediaType: "MMF", reachM: 3, connector: "LC", domSupport: false, priceBase: 340, fiberType: "OM4" }),
    P(cPatch.id, "patch", { sku: "MC-PC-LCSC-SM-3", name: "Патч-корд LC-SC SM 9/125 OS2 duplex 3м", mediaType: "SMF", reachM: 3, connector: "LC", domSupport: false, priceBase: 280, fiberType: "OS2" }),
    P(cPatch.id, "patch", { sku: "MC-PC-MPO-OM4-3", name: "Патч-корд MPO-MPO 12F OM4 3м", mediaType: "MMF", reachM: 3, connector: "MPO", domSupport: false, priceBase: 1450, fiberType: "OM4" }),
    P(cPatch.id, "patch", { sku: "MC-PC-MPO8LC-OM4-2", name: "Брейкаут MPO-8×LC OM4 2м", mediaType: "MMF", reachM: 2, connector: "MPO", domSupport: false, priceBase: 1900, fiberType: "OM4" }),
    P(cPatch.id, "patch", { sku: "MC-PC-SCSC-OM3-3", name: "Патч-корд SC-SC MM 50/125 OM3 duplex 3м", mediaType: "MMF", reachM: 3, connector: "SC", domSupport: false, priceBase: 300, fiberType: "OM3" }),
    P(cPatch.id, "patch", { sku: "MC-PC-LCLC-OM4-5", name: "Патч-корд LC-LC MM 50/125 OM4 duplex 5м", mediaType: "MMF", reachM: 5, connector: "LC", domSupport: false, priceBase: 420, fiberType: "OM4" }),
    P(cPatch.id, "patch", { sku: "MC-PC-MPO-OS2-3", name: "Патч-корд MPO-MPO 12F SM OS2 3м", mediaType: "SMF", reachM: 3, connector: "MPO", domSupport: false, priceBase: 1650, fiberType: "OS2" }),

    // ——— CWDM / DWDM решения ———
    P(cWdm.id, "mux", { sku: "MC-CWDM-MUX8", name: "CWDM мультиплексор 8 каналов 1471-1611nm LC", mediaType: "CWDM", connector: "LC", domSupport: false, priceBase: 16500, oemPrice: oem(16500, 200), oemRef: "FS CWDM-MUX8" }),
    P(cWdm.id, "mux", { sku: "MC-CWDM-MUX16", name: "CWDM мультиплексор 16 каналов dual-fiber LC", mediaType: "CWDM", connector: "LC", domSupport: false, priceBase: 28900, oemPrice: oem(28900, 200), oemRef: "FS CWDM-MUX16" }),
    P(cWdm.id, "mux", { sku: "MC-CWDM-OADM1", name: "CWDM OADM 1-канальный add/drop LC", mediaType: "CWDM", connector: "LC", domSupport: false, priceBase: 7200, oemPrice: oem(7200, 210) }),
    P(cWdm.id, "mux", { sku: "MC-DWDM-MUX40", name: "DWDM мультиплексор 40 каналов 100GHz LC", mediaType: "DWDM", connector: "LC", domSupport: false, priceBase: 74000, oemPrice: oem(74000, 190), oemRef: "FS DWDM-MUX40", stockStatus: "order", leadTimeDays: 21 }),
    P(cWdm.id, "mux", { sku: "MC-DWDM-MUX8", name: "DWDM мультиплексор 8 каналов 100GHz LC", mediaType: "DWDM", connector: "LC", domSupport: false, priceBase: 31000, oemPrice: oem(31000, 195), oemRef: "FS DWDM-MUX8" }),
    P(cWdm.id, "mux", { sku: "MC-CWDM-DEMUX4", name: "CWDM демультиплексор 4 канала LC", mediaType: "CWDM", connector: "LC", domSupport: false, priceBase: 9400, oemPrice: oem(9400, 205) }),
  ];

  await prisma.product.createMany({ data: products as never });

  // — оборудование заказчика (вендоры → серии → модели → порт-группы) —
  type Port = [label: string, count: number, ff: string, speed: string];
  const vendorsData: { name: string; slug: string; sw: string; series: { name: string; models: { name: string; type: string; ports: Port[] }[] }[] }[] = [
    {
      name: "Cisco", slug: "cisco", sw: "IOS-XE 17.6",
      series: [
        { name: "Catalyst 9300", models: [{ name: "C9300-48UXM", type: "switch", ports: [["Uplink", 8, "SFP+", "10G"]] }] },
        { name: "Catalyst 2960-X", models: [{ name: "WS-C2960X-48TS-L", type: "switch", ports: [["Uplink", 4, "SFP", "1G"]] }] },
        { name: "Nexus 9300", models: [{ name: "N9K-C93180YC-EX", type: "switch", ports: [["Downlink", 48, "SFP28", "25G"], ["Uplink", 6, "QSFP28", "100G"]] }] },
        { name: "Nexus 9300-FX2", models: [{ name: "N9K-C9336C-FX2", type: "switch", ports: [["Ports", 36, "QSFP28", "100G"]] }] },
        { name: "Nexus 9300-GX", models: [{ name: "N9K-C9316D-GX", type: "switch", ports: [["Ports", 16, "QSFP-DD", "400G"]] }] },
        { name: "Nexus 9332", models: [{ name: "N9K-C9332PQ", type: "switch", ports: [["Ports", 32, "QSFP+", "40G"]] }] },
      ],
    },
    {
      name: "Juniper", slug: "juniper", sw: "Junos 21.2",
      series: [
        { name: "EX4300", models: [{ name: "EX4300-48T", type: "switch", ports: [["Uplink", 4, "SFP+", "10G"]] }] },
        { name: "QFX5120", models: [{ name: "QFX5120-48Y", type: "switch", ports: [["Downlink", 48, "SFP28", "25G"], ["Uplink", 8, "QSFP28", "100G"]] }] },
        { name: "QFX5220", models: [{ name: "QFX5220-32CD", type: "switch", ports: [["Ports", 32, "QSFP-DD", "400G"]] }] },
      ],
    },
    {
      name: "Huawei", slug: "huawei", sw: "VRP V200R019",
      series: [
        { name: "CloudEngine 6865", models: [{ name: "CE6865-48S8CQ", type: "switch", ports: [["Downlink", 48, "SFP28", "25G"], ["Uplink", 8, "QSFP28", "100G"]] }] },
        { name: "CloudEngine 8851", models: [{ name: "CE8851-32CQ8DQ", type: "switch", ports: [["Ports", 32, "QSFP28", "100G"]] }] },
      ],
    },
    {
      name: "Arista", slug: "arista", sw: "EOS 4.27",
      series: [
        { name: "7050X3", models: [{ name: "7050SX3-48YC8", type: "switch", ports: [["Downlink", 48, "SFP28", "25G"], ["Uplink", 8, "QSFP28", "100G"]] }] },
        { name: "7060X", models: [{ name: "7060CX-32S", type: "switch", ports: [["Ports", 32, "QSFP28", "100G"]] }] },
      ],
    },
    {
      name: "MikroTik", slug: "mikrotik", sw: "RouterOS 7.6",
      series: [
        { name: "CRS3xx", models: [{ name: "CRS317-1G-16S+", type: "switch", ports: [["Ports", 16, "SFP+", "10G"]] }] },
        { name: "CRS5xx", models: [{ name: "CRS504-4XQ", type: "switch", ports: [["Ports", 4, "QSFP28", "100G"]] }] },
      ],
    },
  ];

  const allPorts: { id: string; modelId: string; modelName: string; vendor: string; sw: string; ff: string; speedNum: number }[] = [];
  for (const v of vendorsData) {
    const vendor = await prisma.vendor.create({ data: { name: v.name, slug: v.slug } });
    for (const s of v.series) {
      const series = await prisma.deviceSeries.create({ data: { vendorId: vendor.id, name: s.name } });
      for (const m of s.models) {
        const model = await prisma.deviceModel.create({ data: { seriesId: series.id, name: m.name, deviceType: m.type } });
        for (const [label, count, ff, speed] of m.ports) {
          const pg = await prisma.portGroup.create({ data: { deviceModelId: model.id, label, count, formFactor: ff, speed } });
          allPorts.push({ id: pg.id, modelId: model.id, modelName: m.name, vendor: v.name, sw: v.sw, ff, speedNum: parseInt(speed, 10) });
        }
      }
    }
  }

  // — матрица совместимости (детерминированно: совпадение ФФ+скорость, приоритет→primary) —
  const prods = await prisma.product.findMany({ select: { id: true, sku: true, formFactor: true, speedGbps: true, mediaType: true, stockStatus: true } });
  const prio = ["LR", "LR4", "FR4", "DR4", "CWDM4", "PSM4", "SR", "SR4", "SR8", "ER", "ER4", "ZR", "ZR4", "LRM", "T", "BiDi", "copper", "AOC", "CWDM", "DWDM"];
  const prioIdx = (m: string | null) => { const i = prio.indexOf(m ?? ""); return i < 0 ? 99 : i; };

  const compat: Record<string, unknown>[] = [];
  const seen = new Set<string>();
  for (const pg of allPorts) {
    const match = prods
      .filter((p) => p.formFactor === pg.ff && p.speedGbps === pg.speedNum)
      .sort((a, b) => prioIdx(a.mediaType) - prioIdx(b.mediaType) || a.sku.localeCompare(b.sku))
      .slice(0, 8);
    match.forEach((p, idx) => {
      const key = `${p.id}|${pg.modelId}`;
      if (seen.has(key)) return;
      seen.add(key);
      const role = idx === 0 ? "primary" : "alternative";
      const nonCisco = pg.vendor !== "Cisco";
      compat.push({
        productId: p.id,
        deviceModelId: pg.modelId,
        portGroupId: pg.id,
        role,
        tested: p.stockStatus === "in",
        minSoftwareVersion: nonCisco ? pg.sw : null,
        note: nonCisco && role === "primary" ? `Требует кодирования прошивки под ${pg.vendor}` : null,
      });
    });
  }
  await prisma.compatibility.createMany({ data: compat as never });

  // — демо-аккаунты B2B (W14): компании, пользователи, история заказов, избранное, шаблоны —
  const priceMap = new Map(
    (await prisma.product.findMany({ select: { sku: true, id: true, priceBase: true, pricePartner: true, oemPrice: true } }))
      .map((p) => [p.sku, p]),
  );
  const line = (sku: string, qty: number) => {
    const p = priceMap.get(sku)!;
    return { productId: p.id, qty, priceAt: p.pricePartner ?? p.priceBase, firmware: "Cisco" };
  };

  const mkCompany = async (name: string, inn: string, tier: string) =>
    prisma.company.create({ data: { name, inn, priceTier: tier, requisites: { inn, kpp: "770101001", address: "Москва" } } });

  const mkOrder = async (
    companyId: string,
    userId: string,
    type: string,
    status: string,
    date: string,
    items: { productId: string; qty: number; priceAt: number; firmware: string }[],
  ) =>
    prisma.order.create({
      data: { companyId, userId, type, status, createdAt: new Date(date), items: { create: items } },
    });

  // Компания 1 — партнёр с богатой историей
  const co1 = await mkCompany("ООО «ТелекомСтрой»", "7701234567", "partner");
  const u1 = await prisma.user.create({
    data: { email: "ivan@telecomstroy.ru", passwordHash: "demo", name: "Иван Петров", role: "admin", companyId: co1.id },
  });
  await mkOrder(co1.id, u1.id, "order", "delivered", "2026-02-12", [line("MC-SFP10G-LR", 24), line("MC-SFP10G-DAC3", 12)]);
  await mkOrder(co1.id, u1.id, "order", "delivered", "2026-03-20", [line("MC-QSFP100G-LR4", 6), line("MC-QSFP100G-DAC3", 8)]);
  await mkOrder(co1.id, u1.id, "order", "shipped", "2026-05-28", [line("MC-SFP25G-LR", 48), line("MC-SFP25G-DAC1", 20)]);
  await mkOrder(co1.id, u1.id, "quote", "quote_pending", "2026-06-02", [line("MC-QSFPDD400G-FR4", 4), line("MC-QSFP100G-SR4", 16)]);
  await mkOrder(co1.id, u1.id, "quote", "quote_pending", "2026-06-04", [line("MC-SFP10G-ER", 8)]);
  await prisma.favorite.createMany({
    data: ["MC-QSFP100G-LR4", "MC-SFP25G-LR", "MC-SFP10G-LR", "MC-CWDM-MUX8"].map((sku) => ({ userId: u1.id, productId: priceMap.get(sku)!.id })),
  });
  await prisma.savedConfig.create({ data: { userId: u1.id, type: "compat", code: "TPL-CISCO-9300", payload: { note: "Комплект для Cisco Catalyst 9300" } } });
  await prisma.savedConfig.create({ data: { userId: u1.id, type: "compare", code: "TPL-100G-LR4", payload: { note: "Сравнение 100G LR4 вариантов" } } });

  // Компания 2 — базовый тариф
  const co2 = await mkCompany("АО «ДатаЦентр Сервис»", "7707654321", "base");
  const u2 = await prisma.user.create({
    data: { email: "admin@dc-service.ru", passwordHash: "demo", name: "Мария Сидорова", role: "admin", companyId: co2.id },
  });
  await mkOrder(co2.id, u2.id, "order", "delivered", "2026-04-15", [line("MC-QSFP100G-SR4", 12), line("MC-QSFP100G-AOC7", 6)]);
  await mkOrder(co2.id, u2.id, "quote", "quote_pending", "2026-06-01", [line("MC-QSFPDD400G-DR4", 8)]);
  await prisma.favorite.createMany({
    data: ["MC-QSFP100G-SR4", "MC-QSFPDD400G-DR4"].map((sku) => ({ userId: u2.id, productId: priceMap.get(sku)!.id })),
  });

  const counts = {
    categories: await prisma.category.count(),
    attributes: await prisma.attributeDefinition.count(),
    products: await prisma.product.count(),
    vendors: await prisma.vendor.count(),
    deviceModels: await prisma.deviceModel.count(),
    portGroups: await prisma.portGroup.count(),
    compatibility: await prisma.compatibility.count(),
    companies: await prisma.company.count(),
    orders: await prisma.order.count(),
    favorites: await prisma.favorite.count(),
  };
  console.log("Seed OK:", JSON.stringify(counts));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
