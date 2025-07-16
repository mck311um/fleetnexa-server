/*
  Warnings:

  - A unique constraint covering the columns `[refundId]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currencyId" TEXT;

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "refundId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_refundId_key" ON "Transactions"("refundId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE SET NULL ON UPDATE CASCADE;
