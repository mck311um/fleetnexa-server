-- AlterTable
ALTER TABLE "VehicleGroup" ADD COLUMN     "maintenanceEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MaintenanceServices" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "service" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MaintenanceServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleGroupMaintenanceServices" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleGroupId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "VehicleGroupMaintenanceServices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VehicleGroupMaintenanceServices" ADD CONSTRAINT "VehicleGroupMaintenanceServices_vehicleGroupId_fkey" FOREIGN KEY ("vehicleGroupId") REFERENCES "VehicleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGroupMaintenanceServices" ADD CONSTRAINT "VehicleGroupMaintenanceServices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MaintenanceServices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
