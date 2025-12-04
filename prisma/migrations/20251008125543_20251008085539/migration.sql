/*
  Warnings:

  - You are about to drop the column `geoNameId` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `priceXCD` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionTier` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[planId]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[planCode]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."PlanDetails" DROP CONSTRAINT "PlanDetails_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanFeatures" DROP CONSTRAINT "PlanFeatures_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubscriptionPayment" DROP CONSTRAINT "SubscriptionPayment_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TenantSubscription" DROP CONSTRAINT "TenantSubscription_productId_fkey";

-- DropIndex
DROP INDEX "public"."Country_geoNameId_key";

-- DropIndex
DROP INDEX "public"."SubscriptionPlan_productId_key";

-- AlterTable
ALTER TABLE "public"."Country" DROP COLUMN "geoNameId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "public"."SubscriptionPlan" DROP COLUMN "priceXCD",
DROP COLUMN "productId",
DROP COLUMN "subscriptionTier",
ADD COLUMN     "planCode" TEXT,
ADD COLUMN     "planId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_planId_key" ON "public"."SubscriptionPlan"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_planCode_key" ON "public"."SubscriptionPlan"("planCode");

-- AddForeignKey
ALTER TABLE "public"."Country" ADD CONSTRAINT "Country_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."AdminUser"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanFeatures" ADD CONSTRAINT "PlanFeatures_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanDetails" ADD CONSTRAINT "PlanDetails_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
