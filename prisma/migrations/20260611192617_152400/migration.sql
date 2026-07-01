-- AlterEnum
ALTER TYPE "SecurityDepositTransactionType" ADD VALUE 'WAIVED';

-- AlterTable
ALTER TABLE "SecurityDepositTransaction" ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paymentMethodId" TEXT;
