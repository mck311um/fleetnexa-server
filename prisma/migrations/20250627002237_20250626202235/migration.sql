-- DropForeignKey
ALTER TABLE "DriverLicense" DROP CONSTRAINT "DriverLicense_countryId_fkey";

-- AlterTable
ALTER TABLE "DriverLicense" ALTER COLUMN "countryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DriverLicense" ADD CONSTRAINT "DriverLicense_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
