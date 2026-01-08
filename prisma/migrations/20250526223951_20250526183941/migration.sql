/*
  Warnings:

  - The values [EXPIRED] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentalStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'RESERVED', 'ACTIVE', 'COMPLETED', 'DECLINED', 'CANCELED', 'NO_SHOW', 'REFUNDED');
ALTER TABLE "Rental" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Rental" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TABLE "TenantMonthlyRentalStats" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TYPE "RentalStatus" RENAME TO "RentalStatus_old";
ALTER TYPE "RentalStatus_new" RENAME TO "RentalStatus";
DROP TYPE "RentalStatus_old";
ALTER TABLE "Rental" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "TenantLocation" ADD COLUMN     "rentNexaEnabled" BOOLEAN NOT NULL DEFAULT false;
