/*
  Warnings:

  - You are about to drop the column `depositAmount` on the `Values` table. All the data in the column will be lost.
  - Added the required column `discountAmount` to the `Values` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Values" DROP COLUMN "depositAmount",
ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL;
