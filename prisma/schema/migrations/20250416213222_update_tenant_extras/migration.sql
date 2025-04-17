/*
  Warnings:

  - You are about to drop the column `name` on the `TenantInsurance` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `TenantService` table. All the data in the column will be lost.
  - Added the required column `insurance` to the `TenantInsurance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `TenantService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePolicy` to the `TenantService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantInsurance" DROP COLUMN "name",
ADD COLUMN     "insurance" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TenantService" DROP COLUMN "amount",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pricePolicy" "PricePolicy" NOT NULL;
