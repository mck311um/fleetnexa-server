/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Refund` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[expenseId]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."TransactionType" ADD VALUE 'EXPENSE';

-- DropForeignKey
ALTER TABLE "public"."Transactions" DROP CONSTRAINT "Transactions_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transactions" DROP CONSTRAINT "Transactions_customerId_fkey";

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "public"."Refund" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "public"."Transactions" DROP COLUMN "customerId",
DROP COLUMN "deletedAt",
ADD COLUMN     "expenseId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "updatedBy" TEXT;

-- CreateTable
CREATE TABLE "public"."Expense" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_expenseId_key" ON "public"."Transactions"("expenseId");

-- AddForeignKey
ALTER TABLE "public"."Transactions" ADD CONSTRAINT "Transactions_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "public"."Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."TenantVendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
