-- AlterTable
ALTER TABLE "User" ALTER COLUMN "color" SET DEFAULT '#343434';

-- AlterTable
ALTER TABLE "VehicleDiscount" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedBy" TEXT;
