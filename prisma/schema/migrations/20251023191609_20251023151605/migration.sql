/*
  Warnings:

  - You are about to drop the column `serviceId` on the `VehicleMaintenance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."VehicleMaintenance" DROP CONSTRAINT "VehicleMaintenance_serviceId_fkey";

-- AlterTable
ALTER TABLE "VehicleMaintenance" DROP COLUMN "serviceId";

-- CreateTable
CREATE TABLE "_MaintenanceToServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MaintenanceToServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MaintenanceToServices_B_index" ON "_MaintenanceToServices"("B");

-- AddForeignKey
ALTER TABLE "_MaintenanceToServices" ADD CONSTRAINT "_MaintenanceToServices_A_fkey" FOREIGN KEY ("A") REFERENCES "MaintenanceService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaintenanceToServices" ADD CONSTRAINT "_MaintenanceToServices_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleMaintenance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
