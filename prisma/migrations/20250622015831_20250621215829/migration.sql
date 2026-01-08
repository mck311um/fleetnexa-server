/*
  Warnings:

  - You are about to drop the column `code` on the `VehicleCancellationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `lateFee` on the `VehicleLatePolicy` table. All the data in the column will be lost.
  - Added the required column `amount` to the `VehicleLatePolicy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleCancellationPolicy" DROP COLUMN "code",
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "VehicleLatePolicy" DROP COLUMN "lateFee",
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updatedBy" TEXT;
