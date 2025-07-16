/*
  Warnings:

  - You are about to drop the column `chargeTypeId` on the `Vehicle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_chargeTypeId_fkey";

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "chargeTypeId" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "chargeTypeId";

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_chargeTypeId_fkey" FOREIGN KEY ("chargeTypeId") REFERENCES "ChargeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
