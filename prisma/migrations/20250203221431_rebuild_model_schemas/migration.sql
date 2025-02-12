/*
  Warnings:

  - You are about to drop the column `cancellationAmount` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationPolicy` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `fuelPolicyId` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `lateFee` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `lateFeePolicy` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `maximumBooking` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `minimumAge` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `minimumBooking` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `rentalTypeId` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `reservationType` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `securityDeposit` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `securityDepositPolicy` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `setupComplete` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the `TenantDiscount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_fuelPolicyId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_rentalTypeId_fkey";

-- DropForeignKey
ALTER TABLE "TenantDiscount" DROP CONSTRAINT "TenantDiscount_tenantId_fkey";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "cancellationAmount",
DROP COLUMN "cancellationPolicy",
DROP COLUMN "fuelPolicyId",
DROP COLUMN "lateFee",
DROP COLUMN "lateFeePolicy",
DROP COLUMN "maximumBooking",
DROP COLUMN "minimumAge",
DROP COLUMN "minimumBooking",
DROP COLUMN "rentalTypeId",
DROP COLUMN "reservationType",
DROP COLUMN "securityDeposit",
DROP COLUMN "securityDepositPolicy",
DROP COLUMN "setupComplete",
ADD COLUMN     "setupCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VehicleGroup" ADD COLUMN     "cancellationAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cancellationPolicy" TEXT NOT NULL DEFAULT 'percent',
ADD COLUMN     "fuelPolicyId" INTEGER,
ADD COLUMN     "lateFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lateFeePolicy" TEXT NOT NULL DEFAULT 'percent',
ADD COLUMN     "maximumBooking" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "minimumAge" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN     "minimumBooking" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "rentalTypeId" INTEGER,
ADD COLUMN     "reservationType" TEXT NOT NULL DEFAULT 'group',
ADD COLUMN     "securityDeposit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "securityDepositPolicy" TEXT NOT NULL DEFAULT 'percent';

-- DropTable
DROP TABLE "TenantDiscount";

-- CreateTable
CREATE TABLE "VehicleDiscount" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VehicleDiscountToVehicleGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_VehicleDiscountToVehicleGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_VehicleDiscountToVehicleGroup_B_index" ON "_VehicleDiscountToVehicleGroup"("B");

-- AddForeignKey
ALTER TABLE "VehicleGroup" ADD CONSTRAINT "VehicleGroup_rentalTypeId_fkey" FOREIGN KEY ("rentalTypeId") REFERENCES "RentalType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGroup" ADD CONSTRAINT "VehicleGroup_fuelPolicyId_fkey" FOREIGN KEY ("fuelPolicyId") REFERENCES "FuelPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VehicleDiscountToVehicleGroup" ADD CONSTRAINT "_VehicleDiscountToVehicleGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "VehicleDiscount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VehicleDiscountToVehicleGroup" ADD CONSTRAINT "_VehicleDiscountToVehicleGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
