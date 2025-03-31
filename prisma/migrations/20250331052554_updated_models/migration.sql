/*
  Warnings:

  - Added the required column `featuredImage` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insurance` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insuranceExpiry` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfDoors` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfSeats` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationExpiry` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNumber` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `VehicleDamage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DamageLocation" AS ENUM ('INTERIOR', 'EXTERIOR');

-- DropForeignKey
ALTER TABLE "VehicleDamage" DROP CONSTRAINT "VehicleDamage_partId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "featuredImage" TEXT NOT NULL,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "insurance" TEXT NOT NULL,
ADD COLUMN     "insuranceExpiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numberOfDoors" INTEGER NOT NULL,
ADD COLUMN     "numberOfSeats" INTEGER NOT NULL,
ADD COLUMN     "registrationExpiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "registrationNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VehicleDamage" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "location" "DamageLocation" NOT NULL DEFAULT 'EXTERIOR',
ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "VehicleDamage" ADD CONSTRAINT "VehicleDamage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
