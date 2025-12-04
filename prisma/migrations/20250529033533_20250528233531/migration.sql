/*
  Warnings:

  - You are about to drop the column `damageAmount` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `damagePolicy` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `maximumRental` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `refundPolicy` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "damageAmount",
DROP COLUMN "damagePolicy",
DROP COLUMN "maximumRental",
DROP COLUMN "refundPolicy";
