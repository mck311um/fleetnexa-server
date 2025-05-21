-- CreateTable
CREATE TABLE "TenantReminders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "reminder" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "TenantReminders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantReminders" ADD CONSTRAINT "TenantReminders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
