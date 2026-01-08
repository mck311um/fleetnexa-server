/*
  Warnings:

  - A unique constraint covering the columns `[cancellationPolicyId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[latePolicyId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "cancellationPolicyId" TEXT,
ADD COLUMN     "latePolicyId" TEXT;

-- CreateTable
CREATE TABLE "CancellationPolicy" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "minimumDays" INTEGER NOT NULL,
    "policy" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "CancellationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LatePolicy" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vehicleId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "maxHours" INTEGER NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "LatePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CancellationPolicy_tenantId_key" ON "CancellationPolicy"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "LatePolicy_vehicleId_key" ON "LatePolicy"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_cancellationPolicyId_key" ON "Tenant"("cancellationPolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_latePolicyId_key" ON "Tenant"("latePolicyId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_cancellationPolicyId_fkey" FOREIGN KEY ("cancellationPolicyId") REFERENCES "CancellationPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_latePolicyId_fkey" FOREIGN KEY ("latePolicyId") REFERENCES "LatePolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
