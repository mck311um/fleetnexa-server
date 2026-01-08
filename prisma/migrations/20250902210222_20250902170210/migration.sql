/*
  Warnings:

  - A unique constraint covering the columns `[status]` on the table `VehicleStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VehicleStatus_status_key" ON "public"."VehicleStatus"("status");
