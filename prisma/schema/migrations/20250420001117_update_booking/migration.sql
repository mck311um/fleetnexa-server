/*
  Warnings:

  - You are about to drop the column `pickup` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `return` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `TenantSubscription` table. All the data in the column will be lost.
  - You are about to drop the `_AdditionToBooking` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Agent" ADD VALUE 'PARTNER';

-- DropForeignKey
ALTER TABLE "_AdditionToBooking" DROP CONSTRAINT "_AdditionToBooking_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdditionToBooking" DROP CONSTRAINT "_AdditionToBooking_B_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "pickup",
DROP COLUMN "return";

-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "endDate",
ADD COLUMN     "endDte" TIMESTAMP(3);

-- DropTable
DROP TABLE "_AdditionToBooking";

-- CreateTable
CREATE TABLE "Values" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "numberOfDays" INTEGER NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "collectionFee" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "totalExtras" DOUBLE PRECISION NOT NULL,
    "subTotal" DOUBLE PRECISION NOT NULL,
    "netTotal" DOUBLE PRECISION NOT NULL,
    "bookingId" TEXT NOT NULL,
    "depositMin" INTEGER NOT NULL,
    "depositMax" INTEGER NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL,
    "discountPolicy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingExtras" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "extraId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "valuesId" TEXT NOT NULL,

    CONSTRAINT "BookingExtras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_bookingId_key" ON "Invoice"("bookingId");

-- AddForeignKey
ALTER TABLE "Values" ADD CONSTRAINT "Values_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingExtras" ADD CONSTRAINT "BookingExtras_valuesId_fkey" FOREIGN KEY ("valuesId") REFERENCES "Values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
