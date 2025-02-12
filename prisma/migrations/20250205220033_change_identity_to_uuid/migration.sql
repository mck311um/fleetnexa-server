/*
  Warnings:

  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Country` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Currency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FuelPolicy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FuelType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PaymentMethod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RentalType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `State` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Tenant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TenantPaymentMethod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Transmission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Vehicle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VehicleDiscount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VehicleFeature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VehicleGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pricePerUnit` on the `VehicleGroup` table. All the data in the column will be lost.
  - The primary key for the `VehiclePart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VehicleStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Village` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WheelDrive` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_CountryToTenant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_VehicleDiscountToVehicleGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_VehicleToVehicleFeature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `price` to the `VehicleGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "TenantPaymentMethod" DROP CONSTRAINT "TenantPaymentMethod_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "TenantPaymentMethod" DROP CONSTRAINT "TenantPaymentMethod_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_fuelTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_transmissionId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_vehicleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_vehicleStatusId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_wheelDriveId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_fuelPolicyId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_rentalTypeId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Village" DROP CONSTRAINT "Village_stateId_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToTenant" DROP CONSTRAINT "_CountryToTenant_A_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToTenant" DROP CONSTRAINT "_CountryToTenant_B_fkey";

-- DropForeignKey
ALTER TABLE "_VehicleDiscountToVehicleGroup" DROP CONSTRAINT "_VehicleDiscountToVehicleGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_VehicleDiscountToVehicleGroup" DROP CONSTRAINT "_VehicleDiscountToVehicleGroup_B_fkey";

-- DropForeignKey
ALTER TABLE "_VehicleToVehicleFeature" DROP CONSTRAINT "_VehicleToVehicleFeature_A_fkey";

-- DropForeignKey
ALTER TABLE "_VehicleToVehicleFeature" DROP CONSTRAINT "_VehicleToVehicleFeature_B_fkey";

-- AlterTable
ALTER TABLE "Address" DROP CONSTRAINT "Address_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Address_id_seq";

-- AlterTable
ALTER TABLE "Country" DROP CONSTRAINT "Country_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Country_id_seq";

-- AlterTable
ALTER TABLE "Currency" DROP CONSTRAINT "Currency_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Currency_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Currency_id_seq";

-- AlterTable
ALTER TABLE "FuelPolicy" DROP CONSTRAINT "FuelPolicy_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "FuelPolicy_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FuelPolicy_id_seq";

-- AlterTable
ALTER TABLE "FuelType" DROP CONSTRAINT "FuelType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "FuelType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FuelType_id_seq";

-- AlterTable
ALTER TABLE "PaymentMethod" DROP CONSTRAINT "PaymentMethod_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PaymentMethod_id_seq";

-- AlterTable
ALTER TABLE "RentalType" DROP CONSTRAINT "RentalType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RentalType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RentalType_id_seq";

-- AlterTable
ALTER TABLE "Service" DROP CONSTRAINT "Service_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Service_id_seq";

-- AlterTable
ALTER TABLE "State" DROP CONSTRAINT "State_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "State_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "State_id_seq";

-- AlterTable
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "currencyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Tenant_id_seq";

-- AlterTable
ALTER TABLE "TenantPaymentMethod" DROP CONSTRAINT "TenantPaymentMethod_pkey",
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ALTER COLUMN "paymentMethodId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TenantPaymentMethod_pkey" PRIMARY KEY ("tenantId", "paymentMethodId");

-- AlterTable
ALTER TABLE "Transmission" DROP CONSTRAINT "Transmission_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Transmission_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Transmission_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vehicleGroupId" SET DATA TYPE TEXT,
ALTER COLUMN "vehicleStatusId" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ALTER COLUMN "fuelTypeId" SET DATA TYPE TEXT,
ALTER COLUMN "transmissionId" SET DATA TYPE TEXT,
ALTER COLUMN "wheelDriveId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Vehicle_id_seq";

-- AlterTable
ALTER TABLE "VehicleDiscount" DROP CONSTRAINT "VehicleDiscount_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "VehicleDiscount_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VehicleDiscount_id_seq";

-- AlterTable
ALTER TABLE "VehicleFeature" DROP CONSTRAINT "VehicleFeature_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "VehicleFeature_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VehicleFeature_id_seq";

-- AlterTable
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_pkey",
DROP COLUMN "pricePerUnit",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ALTER COLUMN "fuelPolicyId" SET DATA TYPE TEXT,
ALTER COLUMN "rentalTypeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "VehicleGroup_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VehicleGroup_id_seq";

-- AlterTable
ALTER TABLE "VehiclePart" DROP CONSTRAINT "VehiclePart_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "VehiclePart_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VehiclePart_id_seq";

-- AlterTable
ALTER TABLE "VehicleStatus" DROP CONSTRAINT "VehicleStatus_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "VehicleStatus_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VehicleStatus_id_seq";

-- AlterTable
ALTER TABLE "Village" DROP CONSTRAINT "Village_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "stateId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Village_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Village_id_seq";

-- AlterTable
ALTER TABLE "WheelDrive" DROP CONSTRAINT "WheelDrive_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "WheelDrive_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WheelDrive_id_seq";

-- AlterTable
ALTER TABLE "_CountryToTenant" DROP CONSTRAINT "_CountryToTenant_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_CountryToTenant_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_VehicleDiscountToVehicleGroup" DROP CONSTRAINT "_VehicleDiscountToVehicleGroup_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_VehicleDiscountToVehicleGroup_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_VehicleToVehicleFeature" DROP CONSTRAINT "_VehicleToVehicleFeature_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_VehicleToVehicleFeature_AB_pkey" PRIMARY KEY ("A", "B");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPaymentMethod" ADD CONSTRAINT "TenantPaymentMethod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPaymentMethod" ADD CONSTRAINT "TenantPaymentMethod_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehicleGroupId_fkey" FOREIGN KEY ("vehicleGroupId") REFERENCES "VehicleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehicleStatusId_fkey" FOREIGN KEY ("vehicleStatusId") REFERENCES "VehicleStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_transmissionId_fkey" FOREIGN KEY ("transmissionId") REFERENCES "Transmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_wheelDriveId_fkey" FOREIGN KEY ("wheelDriveId") REFERENCES "WheelDrive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGroup" ADD CONSTRAINT "VehicleGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGroup" ADD CONSTRAINT "VehicleGroup_rentalTypeId_fkey" FOREIGN KEY ("rentalTypeId") REFERENCES "RentalType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleGroup" ADD CONSTRAINT "VehicleGroup_fuelPolicyId_fkey" FOREIGN KEY ("fuelPolicyId") REFERENCES "FuelPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VehicleDiscountToVehicleGroup" ADD CONSTRAINT "_VehicleDiscountToVehicleGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "VehicleDiscount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VehicleDiscountToVehicleGroup" ADD CONSTRAINT "_VehicleDiscountToVehicleGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VehicleToVehicleFeature" ADD CONSTRAINT "_VehicleToVehicleFeature_A_fkey" FOREIGN KEY ("A") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VehicleToVehicleFeature" ADD CONSTRAINT "_VehicleToVehicleFeature_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToTenant" ADD CONSTRAINT "_CountryToTenant_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToTenant" ADD CONSTRAINT "_CountryToTenant_B_fkey" FOREIGN KEY ("B") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
