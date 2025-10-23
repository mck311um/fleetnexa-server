-- CreateTable
CREATE TABLE "public"."VehicleMaintenance" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "vendorId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "VehicleMaintenance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."MaintenanceService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."TenantVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
