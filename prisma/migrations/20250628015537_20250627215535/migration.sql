/*
  Warnings:

  - You are about to drop the column `planId` on the `TenantSubscription` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TenantSubscription" DROP CONSTRAINT "TenantSubscription_planId_fkey";

-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "planId",
ADD COLUMN     "productId" TEXT;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
