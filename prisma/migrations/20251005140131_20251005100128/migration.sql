-- AlterTable
ALTER TABLE "public"."VehicleMaintenance" ADD COLUMN     "tenantId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
