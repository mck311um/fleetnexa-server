/*
  Warnings:

  - You are about to drop the column `rentalId` on the `PaymentReceipt` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[number]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number,tenantId]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PaymentReceipt" DROP CONSTRAINT "PaymentReceipt_rentalId_fkey";

-- AlterTable
ALTER TABLE "PaymentReceipt" DROP COLUMN "rentalId",
ADD COLUMN     "bookingId" TEXT;

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_number_key" ON "Transactions"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_number_tenantId_key" ON "Transactions"("number", "tenantId");

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;
