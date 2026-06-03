-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "formFactor" TEXT,
    "attributeKeys" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AttributeDefinition" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "unit" TEXT,
    "type" TEXT NOT NULL,
    "filterUi" TEXT NOT NULL,
    "facetable" BOOLEAN NOT NULL DEFAULT true,
    "categoryKeys" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "mpn" TEXT,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT,
    "formFactor" TEXT NOT NULL,
    "speedGbps" REAL,
    "mediaType" TEXT,
    "reachM" INTEGER,
    "wavelengthNm" INTEGER,
    "dwdmChannel" TEXT,
    "connector" TEXT,
    "tempRange" TEXT,
    "domSupport" BOOLEAN NOT NULL DEFAULT false,
    "txPowerMin" REAL,
    "txPowerMax" REAL,
    "rxSensitivity" REAL,
    "laserType" TEXT,
    "fiberType" TEXT,
    "powerConsumptionW" REAL,
    "dimensions" TEXT,
    "weightG" REAL,
    "certifications" JSONB,
    "priceBase" REAL NOT NULL,
    "pricePartner" REAL,
    "oemPrice" REAL,
    "oemRef" TEXT,
    "stockStatus" TEXT NOT NULL DEFAULT 'in',
    "leadTimeDays" INTEGER,
    "images" JSONB,
    "documents" JSONB,
    "firmwareOptions" JSONB,
    "attributes" JSONB,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT
);

-- CreateTable
CREATE TABLE "DeviceSeries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "DeviceSeries_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviceModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seriesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    CONSTRAINT "DeviceModel_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "DeviceSeries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceModelId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "formFactor" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    CONSTRAINT "PortGroup_deviceModelId_fkey" FOREIGN KEY ("deviceModelId") REFERENCES "DeviceModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Compatibility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "deviceModelId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'primary',
    "note" TEXT,
    "minSoftwareVersion" TEXT,
    "portGroupId" TEXT,
    "tested" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Compatibility_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Compatibility_deviceModelId_fkey" FOREIGN KEY ("deviceModelId") REFERENCES "DeviceModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Compatibility_portGroupId_fkey" FOREIGN KEY ("portGroupId") REFERENCES "PortGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItuChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grid" TEXT NOT NULL,
    "channelNo" TEXT NOT NULL,
    "freqGHz" REAL,
    "wavelengthNm" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "GlossaryTerm" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OpticalComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "lossDb" REAL NOT NULL,
    "note" TEXT
);

-- CreateTable
CREATE TABLE "Page" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT,
    "promo" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "firmware" TEXT,
    "note" TEXT,
    CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'quote',
    "companyId" TEXT,
    "userId" TEXT,
    "customerJson" JSONB,
    "deliveryJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'new',
    "attachments" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "firmware" TEXT,
    "priceAt" REAL NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "inn" TEXT,
    "requisites" JSONB,
    "priceTier" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "companyId" TEXT,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "contactJson" JSONB,
    "payload" JSONB,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contactJson" JSONB,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "messages" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_formFactor_idx" ON "Product"("formFactor");

-- CreateIndex
CREATE INDEX "Product_speedGbps_idx" ON "Product"("speedGbps");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_slug_key" ON "Vendor"("slug");

-- CreateIndex
CREATE INDEX "DeviceSeries_vendorId_idx" ON "DeviceSeries"("vendorId");

-- CreateIndex
CREATE INDEX "DeviceModel_seriesId_idx" ON "DeviceModel"("seriesId");

-- CreateIndex
CREATE INDEX "Compatibility_productId_idx" ON "Compatibility"("productId");

-- CreateIndex
CREATE INDEX "Compatibility_deviceModelId_idx" ON "Compatibility"("deviceModelId");

-- CreateIndex
CREATE UNIQUE INDEX "Compatibility_productId_deviceModelId_key" ON "Compatibility"("productId", "deviceModelId");

-- CreateIndex
CREATE INDEX "ItuChannel_grid_idx" ON "ItuChannel"("grid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON "Favorite"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedConfig_code_key" ON "SavedConfig"("code");
