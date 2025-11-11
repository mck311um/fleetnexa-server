/*
  Warnings:

  - You are about to drop the column `discountMax` on the `Values` table. All the data in the column will be lost.
  - You are about to drop the column `discountMin` on the `Values` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Values" DROP COLUMN "discountMax",
DROP COLUMN "discountMin";
