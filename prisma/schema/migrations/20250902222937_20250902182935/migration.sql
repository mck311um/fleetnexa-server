-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Refund" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Transactions" ADD COLUMN     "deletedAt" TIMESTAMP(3);
