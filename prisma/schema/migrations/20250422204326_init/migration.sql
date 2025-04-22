/*
  Warnings:

  - You are about to drop the column `make` on the `VehicleBrand` table. All the data in the column will be lost.
  - Added the required column `brand` to the `VehicleBrand` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleBrand" DROP COLUMN "make",
ADD COLUMN     "brand" TEXT NOT NULL;
