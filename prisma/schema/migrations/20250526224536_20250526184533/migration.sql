/*
  Warnings:

  - You are about to drop the column `rentNexaEnabled` on the `TenantLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantLocation" DROP COLUMN "rentNexaEnabled",
ADD COLUMN     "storefrontEnabled" BOOLEAN NOT NULL DEFAULT false;
