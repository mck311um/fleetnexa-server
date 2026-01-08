/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "createdAt",
ADD COLUMN     "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
