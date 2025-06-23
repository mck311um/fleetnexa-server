-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "customerId" TEXT;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
