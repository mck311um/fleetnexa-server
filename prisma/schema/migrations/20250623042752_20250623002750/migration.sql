-- AlterTable
ALTER TABLE "Values" ADD COLUMN     "cancellationFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "lateFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ALTER COLUMN "additionalDriverFees" SET DEFAULT 0.0;
