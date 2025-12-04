-- AlterTable
ALTER TABLE "public"."Refund" ADD COLUMN     "payee" TEXT,
ADD COLUMN     "refund" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Transactions" ADD CONSTRAINT "Transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
