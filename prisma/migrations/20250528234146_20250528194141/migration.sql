/*
  Warnings:

  - You are about to drop the column `plan` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `priceUSD` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "plan",
DROP COLUMN "priceUSD",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "priceXCD" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PlanDetails" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "subscriptionPlanId" TEXT NOT NULL,
    "numberOfUsers" INTEGER NOT NULL,
    "numberOfVehicles" INTEGER NOT NULL,

    CONSTRAINT "PlanDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_productId_key" ON "SubscriptionPlan"("productId");

-- AddForeignKey
ALTER TABLE "PlanDetails" ADD CONSTRAINT "PlanDetails_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
