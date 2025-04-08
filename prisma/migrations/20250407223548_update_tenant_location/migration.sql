/*
  Warnings:

  - You are about to drop the column `createdBy` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `locationAddress` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `locationName` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `pickupFee` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `returnFee` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `TenantService` table. All the data in the column will be lost.
  - Added the required column `addressId` to the `TenantLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collectionFee` to the `TenantLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryFee` to the `TenantLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `TenantLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantLocation" DROP COLUMN "createdBy",
DROP COLUMN "locationAddress",
DROP COLUMN "locationName",
DROP COLUMN "pickupFee",
DROP COLUMN "returnFee",
ADD COLUMN     "addressId" TEXT NOT NULL,
ADD COLUMN     "collectionFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "deliveryFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TenantService" DROP COLUMN "createdBy";

-- CreateTable
CREATE TABLE "TenantLocationAddress" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "street" TEXT,
    "countryId" TEXT,
    "stateId" TEXT,
    "villageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TenantLocationAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantLocation" ADD CONSTRAINT "TenantLocation_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "TenantLocationAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocationAddress" ADD CONSTRAINT "TenantLocationAddress_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocationAddress" ADD CONSTRAINT "TenantLocationAddress_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocationAddress" ADD CONSTRAINT "TenantLocationAddress_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;
