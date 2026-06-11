/*
  Warnings:

  - You are about to drop the column `rentalId` on the `RentalCharge` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `Values` table. All the data in the column will be lost.
  - You are about to drop the column `discountPolicy` on the `Values` table. All the data in the column will be lost.
  - Added the required column `valueId` to the `RentalCharge` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RentalCharge" DROP CONSTRAINT "RentalCharge_rentalId_fkey";

-- AlterTable
ALTER TABLE "RentalCharge" DROP COLUMN "rentalId",
ADD COLUMN     "valueId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Values" DROP COLUMN "discountAmount",
DROP COLUMN "discountPolicy",
ADD COLUMN     "totalCharges" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AddForeignKey
ALTER TABLE "RentalCharge" ADD CONSTRAINT "RentalCharge_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "Values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
