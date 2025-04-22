-- CreateEnum
CREATE TYPE "RentalAction" AS ENUM ('BOOKED', 'CANCELED', 'RETURNED', 'EXTENDED');

-- CreateTable
CREATE TABLE "RentalActivity" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "customerId" TEXT NOT NULL,
    "action" "RentalAction" NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalActivity_pkey" PRIMARY KEY ("id")
);
