/*
  Warnings:

  - You are about to drop the column `vendorTypeId` on the `TenantVendor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TenantVendor" DROP CONSTRAINT "TenantVendor_vendorTypeId_fkey";

-- AlterTable
ALTER TABLE "public"."TenantVendor" DROP COLUMN "vendorTypeId";

-- CreateTable
CREATE TABLE "public"."TenantVendorType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantVendorId" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,

    CONSTRAINT "TenantVendorType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantVendorType_tenantVendorId_vendorTypeId_key" ON "public"."TenantVendorType"("tenantVendorId", "vendorTypeId");

-- AddForeignKey
ALTER TABLE "public"."TenantVendorType" ADD CONSTRAINT "TenantVendorType_tenantVendorId_fkey" FOREIGN KEY ("tenantVendorId") REFERENCES "public"."TenantVendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantVendorType" ADD CONSTRAINT "TenantVendorType_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
