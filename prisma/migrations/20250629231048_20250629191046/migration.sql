/*
  Warnings:

  - You are about to drop the column `rate` on the `TenantCurrencyRate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantCurrencyRate" DROP COLUMN "rate",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fromRate" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "toRate" DOUBLE PRECISION DEFAULT 0.0;
