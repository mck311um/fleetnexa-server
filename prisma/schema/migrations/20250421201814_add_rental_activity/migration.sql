/*
  Warnings:

  - Added the required column `bookingId` to the `RentalActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RentalActivity" ADD COLUMN     "bookingId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RentalActivity" ADD CONSTRAINT "RentalActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalActivity" ADD CONSTRAINT "RentalActivity_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalActivity" ADD CONSTRAINT "RentalActivity_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
