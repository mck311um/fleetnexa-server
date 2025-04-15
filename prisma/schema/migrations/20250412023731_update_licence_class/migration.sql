/*
  Warnings:

  - Added the required column `name` to the `LicenseClass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LicenseClass" ADD COLUMN     "name" TEXT NOT NULL;
