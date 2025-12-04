-- CreateTable
CREATE TABLE "public"."ShopDM" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "merchant_handle" TEXT NOT NULL,
    "merchant_secret" TEXT NOT NULL,

    CONSTRAINT "ShopDM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopDM_tenantId_key" ON "public"."ShopDM"("tenantId");
