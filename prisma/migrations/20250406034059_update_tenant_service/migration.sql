/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryEnabled` on the `TenantLocation` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFee` on the `TenantLocation` table. All the data in the column will be lost.
  - Added the required column `pickupFee` to the `TenantLocation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_tenantId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "createdAt",
DROP COLUMN "price",
DROP COLUMN "status",
DROP COLUMN "tenantId",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "TenantLocation" DROP COLUMN "deliveryEnabled",
DROP COLUMN "deliveryFee",
ADD COLUMN     "pickupFee" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "TenantService" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "serviceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "TenantService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantService" ADD CONSTRAINT "TenantService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantService" ADD CONSTRAINT "TenantService_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
