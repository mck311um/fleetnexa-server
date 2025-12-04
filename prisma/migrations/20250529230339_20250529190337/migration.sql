/*
  Warnings:

  - Added the required column `additionalDriverFees` to the `Values` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Values" ADD COLUMN     "additionalDriverFees" DOUBLE PRECISION NOT NULL;
