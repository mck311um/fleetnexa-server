/*
  Warnings:

  - You are about to alter the column `amount` on the `CancellationPolicy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `amount` on the `LatePolicy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."CancellationPolicy" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."LatePolicy" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;
