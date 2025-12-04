/*
  Warnings:

  - You are about to drop the `CaribbeanCountries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CaribbeanCountries" DROP CONSTRAINT "CaribbeanCountries_countryId_fkey";

-- DropTable
DROP TABLE "CaribbeanCountries";

-- CreateTable
CREATE TABLE "CaribbeanCountry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "countryId" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "CaribbeanCountry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CaribbeanCountry" ADD CONSTRAINT "CaribbeanCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
