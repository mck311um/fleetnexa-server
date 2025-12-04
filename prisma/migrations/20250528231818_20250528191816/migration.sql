/*
  Warnings:

  - You are about to drop the column `features` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `priceId` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - Added the required column `productId` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "features",
DROP COLUMN "priceId",
ADD COLUMN     "productId" TEXT NOT NULL;
