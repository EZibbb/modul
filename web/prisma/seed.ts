// Deterministic seed (W03) — срез K (данные) + B (совместимость).
// Запуск: npm run db:seed  (npx tsx prisma/seed.ts)
// Это стартовый набор; расширяется до ~100 позиций по модулю K.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // — чистим (идемпотентность) —
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
  await prisma.attributeDefinition.createMany({
    data: [
      { key: "speedGbps", label: "Скорость", unit: "G", type: "enum", filterUi: "checkbox", position: 1, categoryKeys: ["sfp-plus", "sfp28", "qsfp28"] },
      { key: "mediaType", label: "Тип среды / стандарт", type: "enum", filterUi: "checkbox", position: 2, categoryKeys: ["sfp-plus", "sfp28", "qsfp28"] },
      { key: "reachM", label: "Дальность", unit: "м", type: "range", filterUi: "range", position: 3, categoryKeys: ["sfp-plus", "sfp28", "qsfp28"] },
      { key: "wavelengthNm", label: "Длина волны", unit: "нм", type: "enum", filterUi: "checkbox", position: 4, categoryKeys: ["sfp-plus", "sfp28", "qsfp28"] },
      { key: "connector", label: "Разъём", type: "enum", filterUi: "checkbox", position: 5, categoryKeys: ["sfp-plus", "sfp28", "qsfp28", "patch"] },
      { key: "tempRange", label: "Температурный диапазон", type: "enum", filterUi: "select", position: 6, categoryKeys: ["sfp-plus", "sfp28", "qsfp28"] },
      { key: "domSupport", label: "Поддержка DOM", type: "bool", filterUi: "checkbox", position: 7, categoryKeys: ["sfp-plus", "sfp28", "qsfp28"] },
    ],
  });

  // — дерево категорий (срез ТЗ 2.1) —
  const transceivers = await prisma.category.create({
    data: { name: "Трансиверы и модули", slug: "transceivers", position: 1 },
  });
  const sfpPlus = await prisma.category.create({
    data: { name: "SFP+ (10G)", slug: "sfp-plus", formFactor: "SFP+", parentId: transceivers.id, position: 1, attributeKeys: ["speedGbps", "mediaType", "reachM", "wavelengthNm", "connector", "tempRange", "domSupport"] },
  });
  const sfp28 = await prisma.category.create({
    data: { name: "SFP28 (25G)", slug: "sfp28", formFactor: "SFP28", parentId: transceivers.id, position: 2, attributeKeys: ["speedGbps", "mediaType", "reachM", "wavelengthNm", "connector", "tempRange", "domSupport"] },
  });
  const qsfp28 = await prisma.category.create({
    data: { name: "QSFP28 (100G)", slug: "qsfp28", formFactor: "QSFP28", parentId: transceivers.id, position: 3, attributeKeys: ["speedGbps", "mediaType", "reachM", "wavelengthNm", "connector", "tempRange", "domSupport"] },
  });
  const dac = await prisma.category.create({
    data: { name: "DAC / AOC кабели", slug: "dac-aoc", position: 2 },
  });
  await prisma.category.create({
    data: { name: "Патч-корды и кабели", slug: "patch", position: 3 },
  });

  const brand = await prisma.brand.create({ data: { name: "Modul comp (compatible)" } });

  // — товары (срез; расширяется до ~100) —
  const P = (d: Record<string, unknown>) =>
    prisma.product.create({ data: { brandId: brand.id, firmwareOptions: ["Generic", "Cisco", "Juniper", "Huawei"], certifications: ["CE", "FCC", "RoHS", "MSA"], images: [], documents: [], attributes: {}, ...(d as object) } as never });

  const lr = await P({ sku: "MC-SFP10G-LR", mpn: "SFP-10G-LR", name: "SFP+ 10GBASE-LR 1310nm 10km LC DOM", categoryId: sfpPlus.id, formFactor: "SFP+", speedGbps: 10, mediaType: "LR", reachM: 10000, wavelengthNm: 1310, connector: "LC", tempRange: "com", domSupport: true, laserType: "DFB", priceBase: 2900, pricePartner: 2400, oemPrice: 9100, oemRef: "Cisco SFP-10G-LR", stockStatus: "in", leadTimeDays: 0 });
  const sr = await P({ sku: "MC-SFP10G-SR", mpn: "SFP-10G-SR", name: "SFP+ 10GBASE-SR 850nm 300m LC DOM", categoryId: sfpPlus.id, formFactor: "SFP+", speedGbps: 10, mediaType: "SR", reachM: 300, wavelengthNm: 850, connector: "LC", tempRange: "com", domSupport: true, laserType: "VCSEL", priceBase: 1700, pricePartner: 1400, oemPrice: 6200, oemRef: "Cisco SFP-10G-SR", stockStatus: "in", leadTimeDays: 0 });
  const er = await P({ sku: "MC-SFP10G-ER", mpn: "SFP-10G-ER", name: "SFP+ 10GBASE-ER 1550nm 40km LC DOM", categoryId: sfpPlus.id, formFactor: "SFP+", speedGbps: 10, mediaType: "ER", reachM: 40000, wavelengthNm: 1550, connector: "LC", tempRange: "com", domSupport: true, laserType: "DFB", priceBase: 7400, pricePartner: 6500, oemPrice: 21000, oemRef: "Cisco SFP-10G-ER", stockStatus: "order", leadTimeDays: 7 });
  const lrInd = await P({ sku: "MC-SFP10G-LR-I", mpn: "SFP-10G-LR-I", name: "SFP+ 10GBASE-LR 1310nm 10km LC DOM Industrial (-40..+85C)", categoryId: sfpPlus.id, formFactor: "SFP+", speedGbps: 10, mediaType: "LR", reachM: 10000, wavelengthNm: 1310, connector: "LC", tempRange: "ind", domSupport: true, laserType: "DFB", priceBase: 4200, pricePartner: 3600, oemPrice: 14500, oemRef: "Cisco SFP-10G-LR=", stockStatus: "in", leadTimeDays: 0 });
  const s28 = await P({ sku: "MC-SFP25G-LR", mpn: "SFP-25G-LR", name: "SFP28 25GBASE-LR 1310nm 10km LC DOM", categoryId: sfp28.id, formFactor: "SFP28", speedGbps: 25, mediaType: "LR", reachM: 10000, wavelengthNm: 1310, connector: "LC", tempRange: "com", domSupport: true, laserType: "DFB", priceBase: 6100, pricePartner: 5300, oemPrice: 18800, oemRef: "Cisco SFP-25G-LR-S", stockStatus: "in", leadTimeDays: 0 });
  const q28lr4 = await P({ sku: "MC-QSFP100G-LR4", mpn: "QSFP-100G-LR4", name: "QSFP28 100GBASE-LR4 CWDM4 10km LC DOM", categoryId: qsfp28.id, formFactor: "QSFP28", speedGbps: 100, mediaType: "LR4", reachM: 10000, wavelengthNm: 1310, connector: "LC", tempRange: "com", domSupport: true, laserType: "DFB", priceBase: 22500, pricePartner: 19900, oemPrice: 78000, oemRef: "Cisco QSFP-100G-LR4-S", stockStatus: "order", leadTimeDays: 10 });
  const q28sr4 = await P({ sku: "MC-QSFP100G-SR4", mpn: "QSFP-100G-SR4", name: "QSFP28 100GBASE-SR4 850nm 100m MPO DOM", categoryId: qsfp28.id, formFactor: "QSFP28", speedGbps: 100, mediaType: "SR4", reachM: 100, wavelengthNm: 850, connector: "MPO", tempRange: "com", domSupport: true, laserType: "VCSEL", priceBase: 12800, pricePartner: 11200, oemPrice: 41000, oemRef: "Cisco QSFP-100G-SR4-S", stockStatus: "in", leadTimeDays: 0 });
  const dac3 = await P({ sku: "MC-QSFP100G-DAC3", mpn: "QSFP-100G-CU3M", name: "QSFP28 100G DAC пассивный 3м", categoryId: dac.id, formFactor: "QSFP28", speedGbps: 100, mediaType: "copper", reachM: 3, connector: "QSFP28", tempRange: "com", domSupport: false, priceBase: 5400, pricePartner: 4700, oemPrice: 16000, oemRef: "Cisco QSFP-100G-CU3M", stockStatus: "in", leadTimeDays: 0 });

  // — оборудование заказчика (B) —
  const cisco = await prisma.vendor.create({ data: { name: "Cisco", slug: "cisco" } });
  const juniper = await prisma.vendor.create({ data: { name: "Juniper", slug: "juniper" } });
  await prisma.vendor.create({ data: { name: "Huawei", slug: "huawei" } });

  const cat9300 = await prisma.deviceSeries.create({ data: { vendorId: cisco.id, name: "Catalyst 9300" } });
  const nexus93180 = await prisma.deviceSeries.create({ data: { vendorId: cisco.id, name: "Nexus 9300" } });
  const ex4300 = await prisma.deviceSeries.create({ data: { vendorId: juniper.id, name: "EX4300" } });

  const c9300 = await prisma.deviceModel.create({ data: { seriesId: cat9300.id, name: "C9300-48UXM", deviceType: "switch" } });
  const n93180 = await prisma.deviceModel.create({ data: { seriesId: nexus93180.id, name: "N9K-C93180YC-EX", deviceType: "switch" } });
  const ex4300_48 = await prisma.deviceModel.create({ data: { seriesId: ex4300.id, name: "EX4300-48T", deviceType: "switch" } });

  const c9300Uplink = await prisma.portGroup.create({ data: { deviceModelId: c9300.id, label: "Uplink", count: 8, formFactor: "SFP+", speed: "10G" } });
  const n93180Down = await prisma.portGroup.create({ data: { deviceModelId: n93180.id, label: "Downlink", count: 48, formFactor: "SFP28", speed: "25G" } });
  const n93180Up = await prisma.portGroup.create({ data: { deviceModelId: n93180.id, label: "Uplink", count: 6, formFactor: "QSFP28", speed: "100G" } });
  const ex4300Up = await prisma.portGroup.create({ data: { deviceModelId: ex4300_48.id, label: "Uplink", count: 4, formFactor: "SFP+", speed: "10G" } });

  // — связи совместимости (M2M с ролью/портом/tested) —
  const C = (productId: string, deviceModelId: string, d: Record<string, unknown>) =>
    prisma.compatibility.create({ data: { productId, deviceModelId, ...(d as object) } as never });

  await C(lr.id, c9300.id, { role: "primary", portGroupId: c9300Uplink.id, tested: true });
  await C(sr.id, c9300.id, { role: "alternative", portGroupId: c9300Uplink.id, tested: true, note: "для коротких линков в стойке" });
  await C(er.id, c9300.id, { role: "alternative", portGroupId: c9300Uplink.id, tested: false, note: "до 40 км" });
  await C(lr.id, ex4300_48.id, { role: "primary", portGroupId: ex4300Up.id, tested: true, minSoftwareVersion: "Junos 18.2", note: "требует прошивки под Juniper" });
  await C(sr.id, ex4300_48.id, { role: "alternative", portGroupId: ex4300Up.id, tested: true });
  await C(s28.id, n93180.id, { role: "primary", portGroupId: n93180Down.id, tested: true });
  await C(q28lr4.id, n93180.id, { role: "primary", portGroupId: n93180Up.id, tested: true });
  await C(q28sr4.id, n93180.id, { role: "alternative", portGroupId: n93180Up.id, tested: true, note: "для внутри-ЦОД" });
  await C(dac3.id, n93180.id, { role: "alternative", portGroupId: n93180Up.id, tested: true, note: "bottom-of-rack" });

  const counts = {
    categories: await prisma.category.count(),
    attributes: await prisma.attributeDefinition.count(),
    products: await prisma.product.count(),
    vendors: await prisma.vendor.count(),
    deviceModels: await prisma.deviceModel.count(),
    compatibility: await prisma.compatibility.count(),
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
