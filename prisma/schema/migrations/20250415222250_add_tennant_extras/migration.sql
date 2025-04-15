-- CreateEnum
CREATE TYPE "ExtraType" AS ENUM ('INSURANCE', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "PricePolicy" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE', 'DAILY_PRICE');

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "equipment" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantInsurance" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePolicy" "PricePolicy" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TenantInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantEquipment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "equipmentId" TEXT NOT NULL,
    "pricePolicy" "PricePolicy" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TenantEquipment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TenantEquipment" ADD CONSTRAINT "TenantEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
