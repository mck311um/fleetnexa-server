/*
  Warnings:

  - A unique constraint covering the columns `[rentalId,driverId]` on the table `RentalDriver` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RentalDriver_rentalId_driverId_key" ON "RentalDriver"("rentalId", "driverId");
