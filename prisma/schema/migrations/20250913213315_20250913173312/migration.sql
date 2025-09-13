/*
  Warnings:

  - Added the required column `customerId` to the `CustomerViolation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `CustomerViolation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CustomerViolation" ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."CustomerViolation" ADD CONSTRAINT "CustomerViolation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerViolation" ADD CONSTRAINT "CustomerViolation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
