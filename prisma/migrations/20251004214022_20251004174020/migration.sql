-- CreateTable
CREATE TABLE "public"."VendorType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,

    CONSTRAINT "VendorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantVendor" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "vendor" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TenantVendor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TenantVendor" ADD CONSTRAINT "TenantVendor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantVendor" ADD CONSTRAINT "TenantVendor_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
