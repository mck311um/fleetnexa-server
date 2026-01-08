/*
  Warnings:

  - You are about to drop the column `lateFeePolicy` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "lateFeePolicy",
ADD COLUMN     "maxHours" INTEGER NOT NULL DEFAULT 0;
