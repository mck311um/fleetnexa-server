-- AlterTable
ALTER TABLE "public"."UserRole" ALTER COLUMN "show" SET DEFAULT true;

-- CreateTable
CREATE TABLE "public"."Violation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "violation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantViolation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "violation" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TenantViolation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TenantViolation" ADD CONSTRAINT "TenantViolation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
