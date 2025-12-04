/*
  Warnings:

  - You are about to drop the column `vendorTypeId` on the `TenantVendor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TenantVendor" DROP CONSTRAINT "TenantVendor_vendorTypeId_fkey";

-- AlterTable
ALTER TABLE "public"."TenantVendor" DROP COLUMN "vendorTypeId";
