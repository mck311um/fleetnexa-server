/*
  Warnings:

  - You are about to drop the column `vin` on the `Vehicle` table. All the data in the column will be lost.
  - Added the required column `engineVolume` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wheelDrive` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Vehicle_vin_key";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "vin",
ADD COLUMN     "engineVolume" INTEGER NOT NULL,
ADD COLUMN     "wheelDrive" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "VehicleParts" (
    "id" SERIAL NOT NULL,
    "partId" TEXT NOT NULL,
    "partName" TEXT NOT NULL,

    CONSTRAINT "VehicleParts_pkey" PRIMARY KEY ("id")
);
