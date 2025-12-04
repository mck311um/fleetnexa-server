/*
  Warnings:

  - You are about to drop the column `vehicleGroupId` on the `VehicleDiscount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rentalId,mainDriver]` on the table `RentalDriver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vehicleId` to the `VehicleDiscount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RentalDriver" ADD COLUMN     "mainDriver" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VehicleDiscount" DROP COLUMN "vehicleGroupId",
ADD COLUMN     "vehicleId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "one_main_driver_per_booking" ON "RentalDriver"("rentalId", "mainDriver");

-- AddForeignKey
ALTER TABLE "VehicleDiscount" ADD CONSTRAINT "VehicleDiscount_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
