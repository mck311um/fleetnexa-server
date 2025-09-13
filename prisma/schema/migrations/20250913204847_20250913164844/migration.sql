/*
  Warnings:

  - A unique constraint covering the columns `[violation]` on the table `TenantViolation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."TenantViolation" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "amount" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "TenantViolation_violation_key" ON "public"."TenantViolation"("violation");
