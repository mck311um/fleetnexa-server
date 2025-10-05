-- CreateEnum
CREATE TYPE "public"."MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."VehicleMaintenance" ADD COLUMN     "status" "public"."MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED';
