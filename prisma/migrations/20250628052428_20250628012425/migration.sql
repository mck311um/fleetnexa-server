-- AlterTable
ALTER TABLE "SubscriptionPayment" ADD COLUMN     "productId" TEXT;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "SubscriptionPlan"("productId") ON DELETE SET NULL ON UPDATE CASCADE;
