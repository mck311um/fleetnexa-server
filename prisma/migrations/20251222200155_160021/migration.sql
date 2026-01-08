/*
  Warnings:

  - A unique constraint covering the columns `[firmaWorkspaceId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "firmaWorkspaceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_firmaWorkspaceId_key" ON "Tenant"("firmaWorkspaceId");
