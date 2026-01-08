/*
  Warnings:

  - You are about to drop the column `paddleCustomerId` on the `TenantSubscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dodoCustomerId]` on the table `TenantSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dodoCustomerId` to the `TenantSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TenantSubscription_paddleCustomerId_key";

-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "paddleCustomerId",
ADD COLUMN     "dodoCustomerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_dodoCustomerId_key" ON "TenantSubscription"("dodoCustomerId");
