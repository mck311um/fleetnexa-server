-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "locationId" TEXT;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "TenantLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
