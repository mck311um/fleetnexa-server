/*
  Warnings:

  - A unique constraint covering the columns `[country]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[geoNameId]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[geoNameId]` on the table `State` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[geoNameId]` on the table `Village` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "geoNameId" INTEGER;

-- AlterTable
ALTER TABLE "State" ADD COLUMN     "geoNameId" INTEGER;

-- AlterTable
ALTER TABLE "Village" ADD COLUMN     "geoNameId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Country_country_key" ON "Country"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Country_geoNameId_key" ON "Country"("geoNameId");

-- CreateIndex
CREATE UNIQUE INDEX "State_geoNameId_key" ON "State"("geoNameId");

-- CreateIndex
CREATE UNIQUE INDEX "Village_geoNameId_key" ON "Village"("geoNameId");
