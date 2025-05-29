/*
  Warnings:

  - You are about to drop the column `vehicleGroupId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Payments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `maximumRental` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimumAge` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimumRental` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeBetweenRentals` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_paymentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_rentalId_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_vehicleGroupId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "vehicleGroupId",
ADD COLUMN     "cancellationAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cancellationPolicy" TEXT NOT NULL DEFAULT 'percent',
ADD COLUMN     "chargeTypeId" TEXT,
ADD COLUMN     "damageAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "damagePolicy" TEXT NOT NULL DEFAULT 'percent',
ADD COLUMN     "drivingExperience" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "fuelPolicyId" TEXT,
ADD COLUMN     "lateFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lateFeePolicy" TEXT NOT NULL DEFAULT 'percent',
ADD COLUMN     "maximumRental" INTEGER NOT NULL,
ADD COLUMN     "minimumAge" INTEGER NOT NULL,
ADD COLUMN     "minimumRental" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "refundAmount" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "refundPolicy" TEXT NOT NULL DEFAULT 'percent',
ADD COLUMN     "timeBetweenRentals" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Payments";

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "paymentTypeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "notes" TEXT,
    "isRefunded" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "PaymentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_chargeTypeId_fkey" FOREIGN KEY ("chargeTypeId") REFERENCES "ChargeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fuelPolicyId_fkey" FOREIGN KEY ("fuelPolicyId") REFERENCES "FuelPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
