/*
  Warnings:

  - Added the required column `tenantId` to the `TenantEquipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `TenantInsurance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PricePolicy" ADD VALUE 'FLAT_RATE';

-- AlterTable
ALTER TABLE "TenantEquipment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "TenantInsurance" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "updatedBy" TEXT;

-- AddForeignKey
ALTER TABLE "TenantInsurance" ADD CONSTRAINT "TenantInsurance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantEquipment" ADD CONSTRAINT "TenantEquipment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
