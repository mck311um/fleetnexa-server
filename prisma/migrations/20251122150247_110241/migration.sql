/*
  Warnings:

  - You are about to drop the column `priceMonthly` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `priceYearly` on the `SubscriptionPlan` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "priceMonthly",
DROP COLUMN "priceYearly",
ADD COLUMN     "period" "BillingPeriod" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;
