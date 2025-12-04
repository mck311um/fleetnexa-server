-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_customerId_fkey";

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
