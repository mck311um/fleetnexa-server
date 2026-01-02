/*
  Warnings:

  - A unique constraint covering the columns `[iso3]` on the table `Country` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "cscId" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "iso3" TEXT,
ADD COLUMN     "phoneCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso3_key" ON "Country"("iso3");
