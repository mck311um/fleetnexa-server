/*
  Warnings:

  - You are about to drop the column `tenantId` on the `VehicleDiscount` table. All the data in the column will be lost.
  - You are about to drop the `_CountryToTenant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToTenant" DROP CONSTRAINT "_CountryToTenant_A_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToTenant" DROP CONSTRAINT "_CountryToTenant_B_fkey";

-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "currency" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "invoiceSequenceId" TEXT;

-- AlterTable
ALTER TABLE "VehicleDiscount" DROP COLUMN "tenantId";

-- DropTable
DROP TABLE "_CountryToTenant";

-- CreateTable
CREATE TABLE "InvoiceSequence" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "prefix" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_invoiceSequenceId_fkey" FOREIGN KEY ("invoiceSequenceId") REFERENCES "InvoiceSequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
