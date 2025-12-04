/*
  Warnings:

  - A unique constraint covering the columns `[countryId]` on the table `CaribbeanCountry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CaribbeanCountry_countryId_key" ON "CaribbeanCountry"("countryId");
