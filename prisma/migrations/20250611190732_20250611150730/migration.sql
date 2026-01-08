-- CreateTable
CREATE TABLE "TenantYearlyStats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "stat" "StatItem" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantYearlyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantYearlyStats_tenantId_year_stat_key" ON "TenantYearlyStats"("tenantId", "year", "stat");

-- AddForeignKey
ALTER TABLE "TenantYearlyStats" ADD CONSTRAINT "TenantYearlyStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
