-- DropForeignKey
ALTER TABLE "public"."Expense" DROP CONSTRAINT "Expense_vendorId_fkey";

-- AlterTable
ALTER TABLE "public"."Expense" ALTER COLUMN "vendorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."TenantVendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
