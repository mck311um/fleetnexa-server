-- DropForeignKey
ALTER TABLE "DriverLicense" DROP CONSTRAINT "DriverLicense_classId_fkey";

-- AlterTable
ALTER TABLE "DriverLicense" ALTER COLUMN "classId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DriverLicense" ADD CONSTRAINT "DriverLicense_classId_fkey" FOREIGN KEY ("classId") REFERENCES "LicenseClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
