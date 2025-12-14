-- CreateEnum
CREATE TYPE "VehicleEventType" AS ENUM ('MAINTENANCE', 'ACCIDENT', 'INSPECTION', 'BOOKING', 'SWAPPED_IN', 'SWAPPED_OUT', 'CHECKED_OUT', 'RETURNED', 'DELIVERED', 'PICKED_UP', 'RELOCATED', 'TOWED', 'MAINTENANCE_SCHEDULED', 'MAINTENANCE_STARTED', 'MAINTENANCE_COMPLETED', 'OUT_OF_SERVICE', 'BACK_IN_SERVICE', 'REGISTRATION_RENEWED', 'INSURANCE_RENEWED', 'ROAD_TAX_RENEWED', 'INSPECTION_FAILED', 'INSPECTION_PASSED', 'BREAKDOWN', 'DAMAGE_REPORTED', 'DAMAGE_REPAIRED', 'THEFT_REPORTED', 'RECOVERED');

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "originalVehicleId" TEXT,
ADD COLUMN     "vehicleSwapped" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BookingVehicleHistory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" TEXT NOT NULL,
    "fromVehicleId" TEXT NOT NULL,
    "toVehicleId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "swappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "swappedBy" TEXT NOT NULL,

    CONSTRAINT "BookingVehicleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleEvent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "type" "VehicleEventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "VehicleEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookingVehicleHistory" ADD CONSTRAINT "BookingVehicleHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVehicleHistory" ADD CONSTRAINT "BookingVehicleHistory_fromVehicleId_fkey" FOREIGN KEY ("fromVehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVehicleHistory" ADD CONSTRAINT "BookingVehicleHistory_toVehicleId_fkey" FOREIGN KEY ("toVehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVehicleHistory" ADD CONSTRAINT "BookingVehicleHistory_swappedBy_fkey" FOREIGN KEY ("swappedBy") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleEvent" ADD CONSTRAINT "VehicleEvent_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
