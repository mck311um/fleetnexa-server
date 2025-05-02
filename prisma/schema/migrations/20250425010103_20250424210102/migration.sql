-- AddForeignKey
ALTER TABLE "TenantWeeklyStats" ADD CONSTRAINT "TenantWeeklyStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
