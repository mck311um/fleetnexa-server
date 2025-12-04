/*
  Warnings:

  - You are about to drop the column `additionalDriverFee` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `securityDeposit` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "daysInMonth" INTEGER NOT NULL DEFAULT 28;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "additionalDriverFee",
DROP COLUMN "price",
DROP COLUMN "securityDeposit",
ADD COLUMN     "dayPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "monthPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "weekPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
