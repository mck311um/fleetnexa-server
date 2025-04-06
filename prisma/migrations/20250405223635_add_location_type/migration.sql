/*
  Warnings:

  - Added the required column `locationTypeId` to the `TenantLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantLocation" ADD COLUMN     "locationTypeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "LocationType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "LocationType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantLocation" ADD CONSTRAINT "TenantLocation_locationTypeId_fkey" FOREIGN KEY ("locationTypeId") REFERENCES "LocationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
