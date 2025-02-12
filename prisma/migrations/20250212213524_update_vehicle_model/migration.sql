/*
  Warnings:

  - You are about to drop the column `tenantId` on the `Vehicle` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_tenantId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "tenantId";
