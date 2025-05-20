/*
  Warnings:

  - You are about to drop the column `tankVolume` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "tankVolume",
ADD COLUMN     "steering" TEXT NOT NULL DEFAULT 'left';
