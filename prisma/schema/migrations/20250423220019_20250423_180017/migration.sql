-- CreateTable
CREATE TABLE "ContactType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "ContactType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantContact" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TenantContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleServiceLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "servicedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "contactId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "scheduledServiceId" TEXT,
    "damageId" TEXT,
    "cost" DOUBLE PRECISION,
    "documents" TEXT[],

    CONSTRAINT "VehicleServiceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleServiceSchedule" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "groupMaintenanceId" TEXT,

    CONSTRAINT "VehicleServiceSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantContact" ADD CONSTRAINT "TenantContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantContact" ADD CONSTRAINT "TenantContact_contactTypeId_fkey" FOREIGN KEY ("contactTypeId") REFERENCES "ContactType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MaintenanceService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "TenantContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_scheduledServiceId_fkey" FOREIGN KEY ("scheduledServiceId") REFERENCES "VehicleServiceSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceLog" ADD CONSTRAINT "VehicleServiceLog_damageId_fkey" FOREIGN KEY ("damageId") REFERENCES "VehicleDamage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceSchedule" ADD CONSTRAINT "VehicleServiceSchedule_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceSchedule" ADD CONSTRAINT "VehicleServiceSchedule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "MaintenanceService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServiceSchedule" ADD CONSTRAINT "VehicleServiceSchedule_groupMaintenanceId_fkey" FOREIGN KEY ("groupMaintenanceId") REFERENCES "VehicleGroupMaintenanceService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
