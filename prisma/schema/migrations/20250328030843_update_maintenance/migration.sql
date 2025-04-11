/*
  Warnings:

  - You are about to drop the `MaintenanceServices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleGroupMaintenanceServices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VehicleGroupMaintenanceServices" DROP CONSTRAINT "VehicleGroupMaintenanceServices_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroupMaintenanceServices" DROP CONSTRAINT "VehicleGroupMaintenanceServices_vehicleGroupId_fkey";

-- DropTable
DROP TABLE "MaintenanceServices";

-- DropTable
DROP TABLE "VehicleGroupMaintenanceServices";

-- CreateTable
CREATE TABLE "MaintenanceService" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "service" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MaintenanceService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleGroupMaintenanceService" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleGroupId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "VehicleGroupMaintenanceService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VehicleGroupMaintenanceService" ADD CONSTRAINT "VehicleGroupMaintenanceService_vehicleGroupId_fkey" FOREIGN KEY ("vehicleGroupId") REFERENCES "VehicleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGroupMaintenanceService" ADD CONSTRAINT "VehicleGroupMaintenanceService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MaintenanceService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
