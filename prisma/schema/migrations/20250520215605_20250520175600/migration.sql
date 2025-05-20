/*
  Warnings:

  - You are about to drop the column `maintenanceEnabled` on the `VehicleGroup` table. All the data in the column will be lost.
  - You are about to drop the column `groupMaintenanceId` on the `VehicleServiceSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `isManual` on the `VehicleServiceSchedule` table. All the data in the column will be lost.
  - You are about to drop the `VehicleGroupMaintenanceService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VehicleGroupMaintenanceService" DROP CONSTRAINT "VehicleGroupMaintenanceService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroupMaintenanceService" DROP CONSTRAINT "VehicleGroupMaintenanceService_vehicleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleServiceSchedule" DROP CONSTRAINT "VehicleServiceSchedule_groupMaintenanceId_fkey";

-- AlterTable
ALTER TABLE "VehicleGroup" DROP COLUMN "maintenanceEnabled";

-- AlterTable
ALTER TABLE "VehicleServiceSchedule" DROP COLUMN "groupMaintenanceId",
DROP COLUMN "isManual";

-- DropTable
DROP TABLE "VehicleGroupMaintenanceService";
