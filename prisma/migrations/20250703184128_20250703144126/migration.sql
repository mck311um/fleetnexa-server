/*
  Warnings:

  - Added the required column `customerId` to the `RentalCharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `RentalCharge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RentalCharge" ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RentalCharge" ADD CONSTRAINT "RentalCharge_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalCharge" ADD CONSTRAINT "RentalCharge_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
