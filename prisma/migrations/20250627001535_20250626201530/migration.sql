/*
  Warnings:

  - A unique constraint covering the columns `[licenseNumber]` on the table `DriverLicense` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DriverLicense_licenseNumber_key" ON "DriverLicense"("licenseNumber");
