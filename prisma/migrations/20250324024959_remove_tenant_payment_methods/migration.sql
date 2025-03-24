/*
  Warnings:

  - You are about to drop the `TenantPaymentMethod` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TenantPaymentMethod" DROP CONSTRAINT "TenantPaymentMethod_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "TenantPaymentMethod" DROP CONSTRAINT "TenantPaymentMethod_tenantId_fkey";

-- DropTable
DROP TABLE "TenantPaymentMethod";

-- CreateTable
CREATE TABLE "_PaymentMethodToTenant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PaymentMethodToTenant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PaymentMethodToTenant_B_index" ON "_PaymentMethodToTenant"("B");

-- AddForeignKey
ALTER TABLE "_PaymentMethodToTenant" ADD CONSTRAINT "_PaymentMethodToTenant_A_fkey" FOREIGN KEY ("A") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentMethodToTenant" ADD CONSTRAINT "_PaymentMethodToTenant_B_fkey" FOREIGN KEY ("B") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
