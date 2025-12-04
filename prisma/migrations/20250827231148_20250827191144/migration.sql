/*
  Warnings:

  - You are about to drop the column `subscriptionPlanId` on the `PlanDetails` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[planId]` on the table `PlanDetails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookingCode]` on the table `Rental` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planId` to the `PlanDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PlanDetails" DROP CONSTRAINT "PlanDetails_subscriptionPlanId_fkey";

-- AlterTable
ALTER TABLE "public"."PlanDetails" DROP COLUMN "subscriptionPlanId",
ADD COLUMN     "planId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SubscriptionPlan" DROP COLUMN "features";

-- CreateTable
CREATE TABLE "public"."PlanFeatures" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "planId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,

    CONSTRAINT "PlanFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanDetails_planId_key" ON "public"."PlanDetails"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_bookingCode_key" ON "public"."Rental"("bookingCode");

-- AddForeignKey
ALTER TABLE "public"."PlanFeatures" ADD CONSTRAINT "PlanFeatures_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanDetails" ADD CONSTRAINT "PlanDetails_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
