/*
  Warnings:

  - You are about to drop the column `mainDriver` on the `RentalDriver` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rentalId,primaryDriver]` on the table `RentalDriver` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "one_main_driver_per_booking";

-- AlterTable
ALTER TABLE "RentalDriver" DROP COLUMN "mainDriver",
ADD COLUMN     "primaryDriver" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "one_primary_driver_per_booking" ON "RentalDriver"("rentalId", "primaryDriver");
