/*
  Warnings:

  - You are about to drop the column `isRefunded` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'PAYMENT';

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "isRefunded";

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "rentalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_paymentId_key" ON "Transactions"("paymentId");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;
