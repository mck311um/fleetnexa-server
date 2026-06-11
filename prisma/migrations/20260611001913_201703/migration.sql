/*
  Warnings:

  - You are about to drop the column `tenantId` on the `RentalCharge` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RentalCharge" DROP CONSTRAINT "RentalCharge_tenantId_fkey";

-- AlterTable
ALTER TABLE "RentalCharge" DROP COLUMN "tenantId";
