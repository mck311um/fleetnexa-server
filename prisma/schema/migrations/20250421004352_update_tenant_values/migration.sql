/*
  Warnings:

  - You are about to drop the column `securityDeposit` on the `VehicleGroup` table. All the data in the column will be lost.
  - You are about to drop the column `securityDepositPolicy` on the `VehicleGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "securityDeposit" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "VehicleGroup" DROP COLUMN "securityDeposit",
DROP COLUMN "securityDepositPolicy";
