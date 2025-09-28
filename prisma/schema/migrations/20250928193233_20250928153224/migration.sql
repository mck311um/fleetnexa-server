/*
  Warnings:

  - You are about to drop the column `insurance` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceExpiry` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `registrationExpiry` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Vehicle" DROP COLUMN "insurance",
DROP COLUMN "insuranceExpiry",
DROP COLUMN "registrationExpiry",
DROP COLUMN "registrationNumber";
