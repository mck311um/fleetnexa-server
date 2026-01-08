-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TenantRatings" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantRatings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantRatings" ADD CONSTRAINT "TenantRatings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
