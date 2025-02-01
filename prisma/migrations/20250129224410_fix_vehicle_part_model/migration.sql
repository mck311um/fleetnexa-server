/*
  Warnings:

  - You are about to drop the `VehicleParts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "VehicleParts";

-- CreateTable
CREATE TABLE "VehiclePart" (
    "id" SERIAL NOT NULL,
    "partId" TEXT NOT NULL,
    "partName" TEXT NOT NULL,

    CONSTRAINT "VehiclePart_pkey" PRIMARY KEY ("id")
);
