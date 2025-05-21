-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatItem" ADD VALUE 'MONTHLY_EARNINGS';
ALTER TYPE "StatItem" ADD VALUE 'MONTHLY_BOOKINGS';
ALTER TYPE "StatItem" ADD VALUE 'MONTHLY_BOOKING_STATUS';

-- CreateTable
CREATE TABLE "TenantMonthlyStats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "stat" "StatItem" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantMonthlyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantMonthlyStats_tenantId_month_year_stat_key" ON "TenantMonthlyStats"("tenantId", "month", "year", "stat");

-- AddForeignKey
ALTER TABLE "TenantMonthlyStats" ADD CONSTRAINT "TenantMonthlyStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
