-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VehicleEventType" ADD VALUE 'ASSIGNED_TO_BOOKING';
ALTER TYPE "VehicleEventType" ADD VALUE 'UNASSIGNED_FROM_BOOKING';
ALTER TYPE "VehicleEventType" ADD VALUE 'EXTENDED_BOOKING';
