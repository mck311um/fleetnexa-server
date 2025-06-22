/*
  Warnings:

  - You are about to drop the column `vehicleId` on the `LatePolicy` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId]` on the table `LatePolicy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingMinimumDays` to the `CancellationPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `LatePolicy` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LatePolicy_vehicleId_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "CancellationPolicy" ADD COLUMN     "bookingMinimumDays" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "LatePolicy" DROP COLUMN "vehicleId",
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LatePolicy_tenantId_key" ON "LatePolicy"("tenantId");
