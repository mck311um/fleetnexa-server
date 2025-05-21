/*
  Warnings:

  - You are about to drop the column `detail` on the `TenantMonthlyStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantMonthlyStats" DROP COLUMN "detail";

-- CreateTable
CREATE TABLE "TenantMonthlyBookingStats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "stat" "StatItem" NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantMonthlyBookingStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantMonthlyBookingStats_tenantId_status_month_year_stat_key" ON "TenantMonthlyBookingStats"("tenantId", "status", "month", "year", "stat");

-- AddForeignKey
ALTER TABLE "TenantMonthlyBookingStats" ADD CONSTRAINT "TenantMonthlyBookingStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
