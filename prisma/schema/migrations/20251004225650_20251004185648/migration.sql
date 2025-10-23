/*
  Warnings:

  - You are about to drop the `TenantVendorType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `vendorTypeId` to the `TenantVendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TenantVendorType" DROP CONSTRAINT "TenantVendorType_tenantVendorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TenantVendorType" DROP CONSTRAINT "TenantVendorType_vendorTypeId_fkey";

-- AlterTable
ALTER TABLE "public"."TenantVendor" ADD COLUMN     "vendorTypeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."TenantVendorType";

-- AddForeignKey
ALTER TABLE "public"."TenantVendor" ADD CONSTRAINT "TenantVendor_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
