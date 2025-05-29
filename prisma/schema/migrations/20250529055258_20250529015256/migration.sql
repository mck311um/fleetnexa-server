/*
  Warnings:

  - You are about to drop the column `customerId` on the `Rental` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_customerId_fkey";

-- AlterTable
ALTER TABLE "Rental" DROP COLUMN "customerId";
