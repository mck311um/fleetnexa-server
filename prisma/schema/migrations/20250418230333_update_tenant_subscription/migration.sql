/*
  Warnings:

  - A unique constraint covering the columns `[paddleCustomerId]` on the table `TenantSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_paddleCustomerId_key" ON "TenantSubscription"("paddleCustomerId");
