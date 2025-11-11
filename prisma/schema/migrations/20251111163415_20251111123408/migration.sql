-- AlterTable
ALTER TABLE "VehicleDiscount" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "period" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "periodPolicy" TEXT NOT NULL DEFAULT 'greater_than';
