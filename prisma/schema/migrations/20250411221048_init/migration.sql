/*
  Warnings:

  - You are about to drop the `Addition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChargeType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Currency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FuelPolicy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FuelType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvoiceSequence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocationType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaintenanceService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentMethod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PresetLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `State` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantLocationAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleDamage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleDiscount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleFeature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleGroupMaintenanceService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleMake` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehiclePart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Village` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WheelDrive` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdditionToBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CountryToVillage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PaymentMethodToTenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VehicleToVehicleFeature` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Addition" DROP CONSTRAINT "Addition_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_stateId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_villageId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_pickupLocationId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_returnLocationId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_vehicleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerAddress" DROP CONSTRAINT "CustomerAddress_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerAddress" DROP CONSTRAINT "CustomerAddress_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerAddress" DROP CONSTRAINT "CustomerAddress_stateId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerAddress" DROP CONSTRAINT "CustomerAddress_villageId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerDocument" DROP CONSTRAINT "CustomerDocument_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerDocument" DROP CONSTRAINT "CustomerDocument_documentId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PresetLocation" DROP CONSTRAINT "PresetLocation_countryId_fkey";

-- DropForeignKey
ALTER TABLE "PresetLocation" DROP CONSTRAINT "PresetLocation_stateId_fkey";

-- DropForeignKey
ALTER TABLE "PresetLocation" DROP CONSTRAINT "PresetLocation_villageId_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_invoiceSequenceId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocation" DROP CONSTRAINT "TenantLocation_addressId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocation" DROP CONSTRAINT "TenantLocation_locationTypeId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocation" DROP CONSTRAINT "TenantLocation_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocationAddress" DROP CONSTRAINT "TenantLocationAddress_countryId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocationAddress" DROP CONSTRAINT "TenantLocationAddress_stateId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocationAddress" DROP CONSTRAINT "TenantLocationAddress_villageId_fkey";

-- DropForeignKey
ALTER TABLE "TenantService" DROP CONSTRAINT "TenantService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "TenantService" DROP CONSTRAINT "TenantService_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_fuelTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_makeId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_modelId_fkey";

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
ALTER TABLE "VehicleDamage" DROP CONSTRAINT "VehicleDamage_customerId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleDamage" DROP CONSTRAINT "VehicleDamage_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleDiscount" DROP CONSTRAINT "VehicleDiscount_vehicleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_chargeTypeId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_fuelPolicyId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroup" DROP CONSTRAINT "VehicleGroup_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroupMaintenanceService" DROP CONSTRAINT "VehicleGroupMaintenanceService_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleGroupMaintenanceService" DROP CONSTRAINT "VehicleGroupMaintenanceService_vehicleGroupId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleModel" DROP CONSTRAINT "VehicleModel_makeId_fkey";

-- DropForeignKey
ALTER TABLE "VehicleModel" DROP CONSTRAINT "VehicleModel_typeId_fkey";

-- DropForeignKey
ALTER TABLE "Village" DROP CONSTRAINT "Village_stateId_fkey";

-- DropForeignKey
ALTER TABLE "_AdditionToBooking" DROP CONSTRAINT "_AdditionToBooking_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdditionToBooking" DROP CONSTRAINT "_AdditionToBooking_B_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToVillage" DROP CONSTRAINT "_CountryToVillage_A_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToVillage" DROP CONSTRAINT "_CountryToVillage_B_fkey";

-- DropForeignKey
ALTER TABLE "_PaymentMethodToTenant" DROP CONSTRAINT "_PaymentMethodToTenant_A_fkey";

-- DropForeignKey
ALTER TABLE "_PaymentMethodToTenant" DROP CONSTRAINT "_PaymentMethodToTenant_B_fkey";

-- DropForeignKey
ALTER TABLE "_VehicleToVehicleFeature" DROP CONSTRAINT "_VehicleToVehicleFeature_A_fkey";

-- DropForeignKey
ALTER TABLE "_VehicleToVehicleFeature" DROP CONSTRAINT "_VehicleToVehicleFeature_B_fkey";

-- DropTable
DROP TABLE "Addition";

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "ChargeType";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "Currency";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "CustomerAddress";

-- DropTable
DROP TABLE "CustomerDocument";

-- DropTable
DROP TABLE "DocumentType";

-- DropTable
DROP TABLE "FuelPolicy";

-- DropTable
DROP TABLE "FuelType";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "InvoiceSequence";

-- DropTable
DROP TABLE "LocationType";

-- DropTable
DROP TABLE "MaintenanceService";

-- DropTable
DROP TABLE "PaymentMethod";

-- DropTable
DROP TABLE "Payments";

-- DropTable
DROP TABLE "PresetLocation";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "State";

-- DropTable
DROP TABLE "Tenant";

-- DropTable
DROP TABLE "TenantLocation";

-- DropTable
DROP TABLE "TenantLocationAddress";

-- DropTable
DROP TABLE "TenantService";

-- DropTable
DROP TABLE "Transmission";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Vehicle";

-- DropTable
DROP TABLE "VehicleDamage";

-- DropTable
DROP TABLE "VehicleDiscount";

-- DropTable
DROP TABLE "VehicleFeature";

-- DropTable
DROP TABLE "VehicleGroup";

-- DropTable
DROP TABLE "VehicleGroupMaintenanceService";

-- DropTable
DROP TABLE "VehicleMake";

-- DropTable
DROP TABLE "VehicleModel";

-- DropTable
DROP TABLE "VehiclePart";

-- DropTable
DROP TABLE "VehicleStatus";

-- DropTable
DROP TABLE "VehicleType";

-- DropTable
DROP TABLE "Village";

-- DropTable
DROP TABLE "WheelDrive";

-- DropTable
DROP TABLE "_AdditionToBooking";

-- DropTable
DROP TABLE "_CountryToVillage";

-- DropTable
DROP TABLE "_PaymentMethodToTenant";

-- DropTable
DROP TABLE "_VehicleToVehicleFeature";

-- DropEnum
DROP TYPE "Agent";

-- DropEnum
DROP TYPE "CustomerStatus";

-- DropEnum
DROP TYPE "DamageLocation";

-- DropEnum
DROP TYPE "Severity";
