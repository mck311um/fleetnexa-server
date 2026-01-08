/*
  Warnings:

  - You are about to drop the column `isVerified` on the `Tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" DROP COLUMN "isVerified",
ADD COLUMN     "businessVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
