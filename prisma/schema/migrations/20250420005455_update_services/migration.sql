/*
  Warnings:

  - You are about to drop the column `depositMax` on the `Values` table. All the data in the column will be lost.
  - You are about to drop the column `depositMin` on the `Values` table. All the data in the column will be lost.
  - Added the required column `discountMax` to the `Values` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountMin` to the `Values` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Values" DROP COLUMN "depositMax",
DROP COLUMN "depositMin",
ADD COLUMN     "discountMax" INTEGER NOT NULL,
ADD COLUMN     "discountMin" INTEGER NOT NULL;
