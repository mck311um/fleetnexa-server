/*
  Warnings:

  - You are about to drop the column `zipCode` on the `CustomerAddress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CustomerAddress" DROP COLUMN "zipCode";

-- AlterTable
ALTER TABLE "DriverLicense" ALTER COLUMN "licenseIssued" DROP NOT NULL;
