// Сервис совместимости (модуль B): каскад вендор→серия→модель + подбор модулей по порт-группам.
import { prisma } from "@/lib/db";

export type VendorCascade = {
  id: string;
  name: string;
  slug: string;
  series: {
    id: string;
    name: string;
    models: { id: string; name: string; deviceType: string; portGroupCount: number }[];
  }[];
}[];

export async function getVendorsCascade(): Promise<VendorCascade> {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
    include: {
      series: {
        orderBy: { name: "asc" },
        include: {
          models: {
            orderBy: { name: "asc" },
            include: { _count: { select: { portGroups: true } } },
          },
        },
      },
    },
  });
  return vendors.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    series: v.series.map((s) => ({
      id: s.id,
      name: s.name,
      models: s.models.map((m) => ({
        id: m.id,
        name: m.name,
        deviceType: m.deviceType,
        portGroupCount: m._count.portGroups,
      })),
    })),
  }));
}

// Сводка для экспресс-подбора на главной: по каждой модели — сколько совместимых модулей + основной.
export async function getCompatSummaryByModel(): Promise<Record<string, { count: number; top: { sku: string; priceBase: number } | null }>> {
  const rows = await prisma.compatibility.findMany({
    include: { product: { select: { sku: true, priceBase: true } } },
  });
  const map: Record<string, { count: number; top: { sku: string; priceBase: number } | null; _hasPrimary: boolean }> = {};
  for (const r of rows) {
    const m = (map[r.deviceModelId] ??= { count: 0, top: null, _hasPrimary: false });
    m.count++;
    const isPrimary = r.role === "primary";
    if (!m.top || (isPrimary && !m._hasPrimary)) {
      m.top = { sku: r.product.sku, priceBase: r.product.priceBase };
      m._hasPrimary = isPrimary;
    }
  }
  const out: Record<string, { count: number; top: { sku: string; priceBase: number } | null }> = {};
  for (const k in map) out[k] = { count: map[k].count, top: map[k].top };
  return out;
}

export type CompatModule = {
  productId: string;
  sku: string;
  name: string;
  mediaType: string | null;
  role: string; // primary | alternative
  tested: boolean;
  minSoftwareVersion: string | null;
  note: string | null;
  priceBase: number;
  pricePartner: number | null;
  stockStatus: string;
  leadTimeDays: number | null;
};

export type CompatByModel = {
  model: { id: string; name: string; deviceType: string; vendor: string; series: string };
  portGroups: {
    id: string;
    label: string;
    count: number;
    formFactor: string;
    speed: string;
    modules: CompatModule[];
  }[];
};

const roleRank = (r: string) => (r === "primary" ? 0 : 1);

export async function getCompatForModel(modelId: string): Promise<CompatByModel | null> {
  const model = await prisma.deviceModel.findUnique({
    where: { id: modelId },
    include: {
      series: { include: { vendor: true } },
      portGroups: {
        include: {
          compatibilities: {
            include: {
              product: {
                select: {
                  id: true, sku: true, name: true, mediaType: true,
                  priceBase: true, pricePartner: true, stockStatus: true, leadTimeDays: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!model) return null;

  return {
    model: {
      id: model.id,
      name: model.name,
      deviceType: model.deviceType,
      vendor: model.series.vendor.name,
      series: model.series.name,
    },
    portGroups: model.portGroups.map((pg) => ({
      id: pg.id,
      label: pg.label,
      count: pg.count,
      formFactor: pg.formFactor,
      speed: pg.speed,
      modules: pg.compatibilities
        .map((c) => ({
          productId: c.product.id,
          sku: c.product.sku,
          name: c.product.name,
          mediaType: c.product.mediaType,
          role: c.role,
          tested: c.tested,
          minSoftwareVersion: c.minSoftwareVersion,
          note: c.note,
          priceBase: c.product.priceBase,
          pricePartner: c.product.pricePartner,
          stockStatus: c.product.stockStatus,
          leadTimeDays: c.product.leadTimeDays,
        }))
        .sort((a, b) => roleRank(a.role) - roleRank(b.role) || a.priceBase - b.priceBase),
    })),
  };
}

// Обратное направление (W02): для карточки товара — на каком оборудовании протестирован/совместим.
export async function getCompatForProduct(productId: string) {
  const rows = await prisma.compatibility.findMany({
    where: { productId },
    include: {
      deviceModel: { include: { series: { include: { vendor: true } } } },
      portGroup: true,
    },
    orderBy: { tested: "desc" },
  });
  return rows.map((c) => ({
    modelId: c.deviceModel.id,
    model: c.deviceModel.name,
    vendor: c.deviceModel.series.vendor.name,
    series: c.deviceModel.series.name,
    portGroup: c.portGroup ? `${c.portGroup.label} ${c.portGroup.count}×${c.portGroup.formFactor} ${c.portGroup.speed}` : null,
    role: c.role,
    tested: c.tested,
    minSoftwareVersion: c.minSoftwareVersion,
    note: c.note,
  }));
}
