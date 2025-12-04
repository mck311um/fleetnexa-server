/*
  Warnings:

  - Made the column `vehicleId` on table `VehicleMaintenance` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Expense" DROP CONSTRAINT "Expense_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VehicleMaintenance" DROP CONSTRAINT "VehicleMaintenance_vehicleId_fkey";

-- AlterTable
ALTER TABLE "public"."Expense" ALTER COLUMN "vehicleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."VehicleMaintenance" ALTER COLUMN "vehicleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
