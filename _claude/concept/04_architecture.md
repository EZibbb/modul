# 04 — Архитектура Modul comp

> Сводный технический документ: единая модель данных, связи, карта API, потоки. Источник — спеки `03_features/*`. Перед сборкой кода (Этап 2).

## Слои приложения

```
┌─────────────────────────────────────────────────────────┐
│  Next.js (App Router)                                     │
│  ├─ Server Components — каталог, карточка, инфо (SSR/SEO) │
│  ├─ Client Components — фасеты, Cmd+K, ИИ-чат, калькул.   │
│  └─ Route Handlers (/api/*) — каталог, compat, ai, cart   │
├─────────────────────────────────────────────────────────┤
│  Сервисы                                                  │
│  ├─ catalog (фасеты, поиск, агрегации)                    │
│  ├─ compat  (подбор по портам, комплект)                  │
│  ├─ ai      (Claude API + tool use, prompt caching)       │
│  └─ tools   (оптбюджет, декодер, экономия, ITU)           │
├─────────────────────────────────────────────────────────┤
│  Prisma ORM                                               │
│  └─ SQLite (dev) → PostgreSQL/Neon (prod)                 │
└─────────────────────────────────────────────────────────┘
        ▲ seed (CSV/TS)        ▲ Claude API (@anthropic-ai/sdk)
        └ имитация 1С/ERP       └ внешний (ключ на сервере)
```

## Модель данных (Prisma — концептуально)

### Каталог (K)
```
Category   { id, parentId?, name, slug, formFactor?, attributeKeys[] }   // дерево
Brand      { id, name }                                                   // произв./чип
AttributeDefinition { key, label, unit?, type, filterUi, facetable, categoryKeys[] }
Product {
  id, sku @unique, mpn, name, categoryId→Category, brandId→Brand,
  formFactor, speedGbps, mediaType, reachM, wavelengthNm?, dwdmChannel?,
  connector, tempRange, domSupport, txPowerMin?, txPowerMax?, rxSensitivity?,
  laserType?, fiberType?, powerConsumptionW?, dimensions?, weightG?,
  certifications[], priceBase, pricePartner?, oemPrice?, oemRef?,
  stockStatus, leadTimeDays?, images[], documents[],
  firmwareOptions Json,   // ["Generic","Cisco",...]  (D-007, Вариант А)
  attributes Json         // спец. поля категории
}
```

### Совместимость (B)
```
Vendor       { id, name, slug, logo }                         // Cisco, Juniper...
DeviceSeries { id, vendorId→Vendor, name }                    // Catalyst 9300
DeviceModel  { id, seriesId→DeviceSeries, name, deviceType }  // WS-C2960X-24TS-L
PortGroup    { id, deviceModelId→DeviceModel, label, count, formFactor, speed }
Compatibility {
  id, productId→Product, deviceModelId→DeviceModel,
  role, note?, minSoftwareVersion?, portGroupId?→PortGroup, tested
  @@unique([productId, deviceModelId]) @@index([productId]) @@index([deviceModelId])
}
```

### Справочники / контент (G, M)
```
ItuChannel       { id, grid, channelNo, freqGHz, wavelengthNm }   // CWDM/DWDM
GlossaryTerm     { slug, term, definition }
Article          { slug, title, category, body, date }
OpticalComponent { id, kind, lossDb, note }                       // пресеты затуханий
Page             { slug, title, body }
```

### Коммерция (E)
```
Cart   { id, userId?/sessionId, promo?, items: CartItem[] }
CartItem { id, cartId, productId→Product, qty, firmware?, note? }
Order  { id, type[order|quote], companyId?, userId?, customerJson,
         deliveryJson, status, attachments[], items: OrderItem[], createdAt }
OrderItem { id, orderId, productId, qty, firmware?, priceAt }
```

### Аккаунты (F) + сквозное (N, H, J, L)
```
User        { id, email @unique, passwordHash, role, companyId? }
Company     { id, name, inn?, requisites Json, priceTier? }
Favorite    { id, userId, productId }
SavedConfig { id, userId?, type[compare|compat|line], payload Json, code @unique, createdAt }
ServiceRequest { id, type[coding|testing|custom], contactJson, payload Json, status }
ContactRequest { id, contactJson, message, createdAt }
Conversation   { id, userId?, messages Json, createdAt }   // история ИИ-чата
```

## Карта связей (ER, кратко)
- `Category` 1—N `Product` N—1 `Brand`
- `Product` N—M `DeviceModel` через `Compatibility` (+ role/note/minSW/portGroup/tested)
- `Vendor` 1—N `DeviceSeries` 1—N `DeviceModel` 1—N `PortGroup`
- `Cart` 1—N `CartItem` →`Product`; `Order` 1—N `OrderItem`
- `Company` 1—N `User`; `User` 1—N `Favorite`/`SavedConfig`/`Conversation`
- `AttributeDefinition` ↔ `Category.attributeKeys` → управляет фасетами (A)

## Карта API (Route Handlers)
| Группа | Эндпоинт | Модуль |
|---|---|---|
| Каталог | `GET /api/catalog` (фильтры→items+facets+total) | A |
| | `GET /api/search/suggest` | A, N |
| Карточка | `GET /api/product/[sku]` · `/compat` · `/related` | C |
| Совместимость | `GET /api/compat/{vendors,series,models,result}` | B |
| ИИ | `POST /api/ai/chat` (stream, tool use) | L |
| Инструменты | `POST /api/tools/{budget,savings,line-config}` · `GET /decode,itu-grid` | G, M |
| Корзина/заказ | `POST /api/cart` · `POST /api/order` · `POST /api/quick-order/validate` | E |
| Аккаунт | NextAuth `/api/auth/*` · `/api/favorites` · `/api/saved-config` | F, N |
| Сервис/контакт | `POST /api/service-request` · `POST /api/contact` | H, J |

## Ключевые потоки
1. **Фасетный поиск (A):** запрос фильтров → catalog-сервис (Prisma where + groupBy для счётчиков с учётом активных фильтров) → items + facets[{value,count}]. Состояние в URL (W06).
2. **Подбор совместимости (B):** vendor→series→model → `Compatibility` join, группировка по `PortGroup`, role Основной/Альтернатива → таблица + «комплект в корзину».
3. **ИИ tool use (L):** сообщение → Claude (system+cache) → вызывает tools (`search_products`/`get_compatibility`/`calc_optical_budget`) → реальные данные из Prisma → grounded-ответ со ссылками на SKU. Стриминг. Офлайн-режим (D-006) — предзаписанные сценарии.
4. **Заказ/КП (E):** Cart → Order(type=quote) (в демо без эквайринга) → заявка.

## Seed-стратегия (K)
- TS/JSON-датасеты → `prisma db seed`, **детерминированно** (W03).
- Имитация выгрузки 1С: CSV-импортёр (товары + матрица совместимости) — демонстрирует «как зальётся боевое».

## Мост в production (рост, не переписывание)
| Сейчас (seed) | Боевое (после трудоустройства) |
|---|---|
| CSV/TS seed | Импорт из 1С/ERP (CommerceML) тем же импортёром |
| SQLite | PostgreSQL/Neon (Prisma — без смены кода) |
| Order=quote | Реальная оплата (эквайринг) + юр-часть |
| priceTier seed | Индивидуальные цены из CRM |
| Ключ Claude в .env | Тот же, прод-лимиты |

## Открытые решения, влияющие на архитектуру
D-007 (прошивки А/Б → `firmwareOptions` vs отдельные SKU) · D-006 (офлайн-ИИ) · D-005 (дизайн-токены для тем, N2).
