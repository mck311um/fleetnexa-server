/*
  Warnings:

  - You are about to drop the column `vehicleGroupId` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the `VehicleGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_vehicleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleDiscount" DROP CONSTRAINT "VehicleDiscount_vehicleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_chargeTypeId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_fuelPolicyId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_tenantId_fkey";

-- AlterTable
ALTER TABLE "Rental" DROP COLUMN "vehicleGroupId";

-- DropTable
DROP TABLE "VehicleGroup";

-- CreateTable
CREATE TABLE "RentalDriver" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "rentalId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,

    CONSTRAINT "RentalDriver_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RentalDriver" ADD CONSTRAINT "RentalDriver_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalDriver" ADD CONSTRAINT "RentalDriver_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
