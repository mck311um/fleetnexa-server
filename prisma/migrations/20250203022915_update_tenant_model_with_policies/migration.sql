-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "cancellationAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cancellationPolicy" TEXT NOT NULL DEFAULT 'percent',
ADD COLUMN     "fuelPolicyId" INTEGER,
ADD COLUMN     "lateFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lateFeePolicy" TEXT NOT NULL DEFAULT 'percent',
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "reservationType" TEXT NOT NULL DEFAULT 'group',
ADD COLUMN     "securityDeposit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "securityDepositPolicy" TEXT NOT NULL DEFAULT 'percent';

-- CreateTable
CREATE TABLE "FuelPolicy" (
    "id" SERIAL NOT NULL,
    "policy" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "FuelPolicy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_fuelPolicyId_fkey" FOREIGN KEY ("fuelPolicyId") REFERENCES "FuelPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
