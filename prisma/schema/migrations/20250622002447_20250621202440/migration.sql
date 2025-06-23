/*
  Warnings:

  - You are about to drop the column `cancellationAmount` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationPolicy` on the `Vehicle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cancellationPolicyId]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[latePolicyId]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- DropIndex
DROP INDEX "UserRole_name_key";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "cancellationAmount",
DROP COLUMN "cancellationPolicy",
ADD COLUMN     "cancellationPolicyId" TEXT,
ADD COLUMN     "latePolicyId" TEXT;

-- CreateTable
CREATE TABLE "VehicleCancellationPolicy" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "minimumDays" INTEGER NOT NULL,
    "policy" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "code" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "VehicleCancellationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleLatePolicy" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "lateFee" DECIMAL(10,2) NOT NULL,
    "maxHours" INTEGER NOT NULL,

    CONSTRAINT "VehicleLatePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCancellationPolicy_vehicleId_key" ON "VehicleCancellationPolicy"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleLatePolicy_vehicleId_key" ON "VehicleLatePolicy"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_cancellationPolicyId_key" ON "Vehicle"("cancellationPolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_latePolicyId_key" ON "Vehicle"("latePolicyId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_cancellationPolicyId_fkey" FOREIGN KEY ("cancellationPolicyId") REFERENCES "VehicleCancellationPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_latePolicyId_fkey" FOREIGN KEY ("latePolicyId") REFERENCES "VehicleLatePolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
