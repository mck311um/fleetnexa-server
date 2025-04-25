-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_invoiceId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "invoiceUrl" TEXT;
