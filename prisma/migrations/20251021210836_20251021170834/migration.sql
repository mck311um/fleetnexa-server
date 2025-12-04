/*
  Warnings:

  - Changed the type of `licenseIssued` on the `StorefrontUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."StorefrontUser" DROP CONSTRAINT "StorefrontUser_countryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StorefrontUser" DROP CONSTRAINT "StorefrontUser_stateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StorefrontUser" DROP CONSTRAINT "StorefrontUser_villageId_fkey";

-- AlterTable
ALTER TABLE "StorefrontUser" DROP COLUMN "licenseIssued",
ADD COLUMN     "licenseIssued" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "street" DROP NOT NULL,
ALTER COLUMN "villageId" DROP NOT NULL,
ALTER COLUMN "stateId" DROP NOT NULL,
ALTER COLUMN "countryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;
