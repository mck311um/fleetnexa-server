/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "createdBy";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
