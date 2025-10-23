/*
  Warnings:

  - Added the required column `tenantId` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."EmailVerification_email_key";

-- AlterTable
ALTER TABLE "public"."EmailVerification" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "EmailVerification_email_idx" ON "public"."EmailVerification"("email");

-- AddForeignKey
ALTER TABLE "public"."EmailVerification" ADD CONSTRAINT "EmailVerification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
