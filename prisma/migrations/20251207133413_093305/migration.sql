/*
  Warnings:

  - A unique constraint covering the columns `[whatsappNumber]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "whatsappNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_whatsappNumber_key" ON "Tenant"("whatsappNumber");
