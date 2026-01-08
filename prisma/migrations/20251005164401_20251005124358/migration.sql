-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "maintenanceId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "public"."VehicleMaintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
