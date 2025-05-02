/*
  Warnings:

  - You are about to drop the column `makeId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `VehicleMake` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `brandId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_makeId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleModel" DROP CONSTRAINT "VehicleModel_makeId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleModel" DROP CONSTRAINT "VehicleModel_typeId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "makeId",
ADD COLUMN     "brandId" TEXT NOT NULL;

-- DropTable
DROP TABLE "VehicleMake";

-- DropTable
DROP TABLE "VehicleType";

-- CreateTable
CREATE TABLE "VehicleBrand" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "make" TEXT NOT NULL,

    CONSTRAINT "VehicleBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBodyType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bodyType" TEXT NOT NULL,

    CONSTRAINT "VehicleBodyType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VehicleModel" ADD CONSTRAINT "VehicleModel_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleModel" ADD CONSTRAINT "VehicleModel_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "VehicleBodyType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
