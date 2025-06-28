-- DropForeignKey
ALTER TABLE "TenantSubscription" DROP CONSTRAINT "TenantSubscription_productId_fkey";

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "SubscriptionPlan"("productId") ON DELETE SET NULL ON UPDATE CASCADE;
