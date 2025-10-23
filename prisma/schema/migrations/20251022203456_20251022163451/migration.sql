/*
  Warnings:

  - A unique constraint covering the columns `[storefrontId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,storefrontId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "storefrontId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_storefrontId_key" ON "Customer"("storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_storefrontId_key" ON "Customer"("tenantId", "storefrontId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "StorefrontUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
