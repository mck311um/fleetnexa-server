/*
  Warnings:

  - Added the required column `email` to the `TenantRatings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `TenantRatings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantRatings" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL;
