/*
  Warnings:

  - You are about to drop the column `cancellationPolicyId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `lateFee` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `latePolicyId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `maxHours` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `VehicleCancellationPolicy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleLatePolicy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_cancellationPolicyId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_latePolicyId_fkey";

-- DropIndex
DROP INDEX "Vehicle_cancellationPolicyId_key";

-- DropIndex
DROP INDEX "Vehicle_latePolicyId_key";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "cancellationPolicyId",
DROP COLUMN "lateFee",
DROP COLUMN "latePolicyId",
DROP COLUMN "maxHours";

-- DropTable
DROP TABLE "VehicleCancellationPolicy";

-- DropTable
DROP TABLE "VehicleLatePolicy";
