/*
  Warnings:

  - You are about to drop the column `periodMax` on the `VehicleDiscount` table. All the data in the column will be lost.
  - You are about to drop the column `periodMin` on the `VehicleDiscount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VehicleDiscount" DROP COLUMN "periodMax",
DROP COLUMN "periodMin";
