/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `PaymentReceipt` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentId` to the `PaymentReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentReceipt" ADD COLUMN     "paymentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_paymentId_key" ON "PaymentReceipt"("paymentId");

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
