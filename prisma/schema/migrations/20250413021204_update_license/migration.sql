/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `DriverLicense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "experience" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "DriverLicense_customerId_key" ON "DriverLicense"("customerId");
