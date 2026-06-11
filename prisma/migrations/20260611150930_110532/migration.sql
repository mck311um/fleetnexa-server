/*
  Warnings:

  - You are about to drop the column `amountDue` on the `Values` table. All the data in the column will be lost.
  - You are about to drop the column `customDeposit` on the `Values` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Values" DROP COLUMN "amountDue",
DROP COLUMN "customDeposit";

-- CreateTable
CREATE TABLE "SecurityDeposit" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountHeld" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "amountRefunded" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SecurityDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecurityDeposit_bookingId_key" ON "SecurityDeposit"("bookingId");

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
