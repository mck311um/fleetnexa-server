/*
  Warnings:

  - You are about to drop the column `price` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - Added the required column `priceUSD` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceXCD` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "price",
ADD COLUMN     "priceUSD" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "priceXCD" DOUBLE PRECISION NOT NULL;
