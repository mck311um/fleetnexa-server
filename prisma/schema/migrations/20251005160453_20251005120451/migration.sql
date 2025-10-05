-- DropForeignKey
ALTER TABLE "public"."VehicleMaintenance" DROP CONSTRAINT "VehicleMaintenance_vehicleId_fkey";

-- AlterTable
ALTER TABLE "public"."VehicleMaintenance" ALTER COLUMN "vehicleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
