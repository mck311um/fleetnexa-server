/*
  Warnings:

  - Added the required column `tenantId` to the `RentalActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RentalActivity" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RentalActivity" ADD CONSTRAINT "RentalActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
