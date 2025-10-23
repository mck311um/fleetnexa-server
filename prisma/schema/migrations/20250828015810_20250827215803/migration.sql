/*
  Warnings:

  - You are about to drop the column `islandWideDelivery` on the `Tenant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "public"."Tenant" DROP COLUMN "islandWideDelivery",
ALTER COLUMN "storefrontEnabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "show" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "public"."UserRole" ADD COLUMN     "show" BOOLEAN DEFAULT false;
