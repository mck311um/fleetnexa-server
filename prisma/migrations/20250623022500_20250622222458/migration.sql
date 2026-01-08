-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rentalId" TEXT,
    "reason" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;
