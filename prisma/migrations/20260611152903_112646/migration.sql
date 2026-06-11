/*
  Warnings:

  - You are about to drop the column `amountHeld` on the `SecurityDeposit` table. All the data in the column will be lost.
  - Added the required column `updatedBy` to the `SecurityDeposit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SecurityDepositStatus" AS ENUM ('PENDING', 'WAIVED', 'COLLECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SecurityDepositTransactionType" AS ENUM ('COLLECTED', 'REFUNDED', 'FORFEITED');

-- AlterTable
ALTER TABLE "SecurityDeposit" DROP COLUMN "amountHeld",
ADD COLUMN     "amountCollected" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "amountForfeited" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "status" "SecurityDepositStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedBy" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SecurityDepositTransaction" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "securityDepositId" TEXT NOT NULL,
    "type" "SecurityDepositTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "SecurityDepositTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDepositTransaction" ADD CONSTRAINT "SecurityDepositTransaction_securityDepositId_fkey" FOREIGN KEY ("securityDepositId") REFERENCES "SecurityDeposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDepositTransaction" ADD CONSTRAINT "SecurityDepositTransaction_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
