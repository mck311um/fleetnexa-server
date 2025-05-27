/*
  Warnings:

  - You are about to drop the column `addressId` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `locationTypeId` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the `LocationType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantLocationAddress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TenantLocation" DROP CONSTRAINT "TenantLocation_addressId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocation" DROP CONSTRAINT "TenantLocation_locationTypeId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocationAddress" DROP CONSTRAINT "TenantLocationAddress_countryId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocationAddress" DROP CONSTRAINT "TenantLocationAddress_stateId_fkey";

-- DropForeignKey
ALTER TABLE "TenantLocationAddress" DROP CONSTRAINT "TenantLocationAddress_villageId_fkey";

-- AlterTable
ALTER TABLE "TenantLocation" DROP COLUMN "addressId",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "isDeleted",
DROP COLUMN "locationTypeId",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "minimumRentalPeriod" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "LocationType";

-- DropTable
DROP TABLE "TenantLocationAddress";
