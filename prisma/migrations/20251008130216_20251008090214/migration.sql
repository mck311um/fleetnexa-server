/*
  Warnings:

  - You are about to drop the column `dodoCustomerId` on the `TenantSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `TenantSubscription` table. All the data in the column will be lost.
  - You are about to drop the `SubscriptionPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SubscriptionPayment" DROP CONSTRAINT "SubscriptionPayment_customerId_fkey";

-- DropIndex
DROP INDEX "public"."TenantSubscription_dodoCustomerId_key";

-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "dodoCustomerId",
DROP COLUMN "productId",
ADD COLUMN     "planId" TEXT;

-- DropTable
DROP TABLE "public"."SubscriptionPayment";

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("planId") ON DELETE SET NULL ON UPDATE CASCADE;
