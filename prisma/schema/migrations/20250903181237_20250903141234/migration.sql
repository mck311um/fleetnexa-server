/*
  Warnings:

  - You are about to drop the `ShopDM` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "merchantId" TEXT;

-- DropTable
DROP TABLE "public"."ShopDM";

-- CreateTable
CREATE TABLE "public"."ShopDMMerchant" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "merchant_handle" TEXT NOT NULL,
    "merchant_secret" TEXT NOT NULL,

    CONSTRAINT "ShopDMMerchant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopDMMerchant_tenantId_key" ON "public"."ShopDMMerchant"("tenantId");

-- AddForeignKey
ALTER TABLE "public"."ShopDMMerchant" ADD CONSTRAINT "ShopDMMerchant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
