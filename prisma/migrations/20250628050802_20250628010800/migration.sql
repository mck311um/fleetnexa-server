/*
  Warnings:

  - Added the required column `numberOfLocations` to the `PlanDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlanDetails" ADD COLUMN     "numberOfLocations" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "paymentId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_paymentId_key" ON "SubscriptionPayment"("paymentId");

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "TenantSubscription"("dodoCustomerId") ON DELETE RESTRICT ON UPDATE CASCADE;
