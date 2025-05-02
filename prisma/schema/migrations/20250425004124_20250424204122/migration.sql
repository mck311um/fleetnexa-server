-- CreateEnum
CREATE TYPE "StatItem" AS ENUM ('TOTAL_REVENUE', 'NEW_BOOKINGS', 'RENTED_VEHICLES', 'TOTAL_CUSTOMERS');

-- CreateTable
CREATE TABLE "TenantWeeklyStats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "stat" "StatItem" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantWeeklyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantWeeklyStats_tenantId_week_year_stat_key" ON "TenantWeeklyStats"("tenantId", "week", "year", "stat");
