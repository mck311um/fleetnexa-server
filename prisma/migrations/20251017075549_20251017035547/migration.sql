-- CreateEnum
CREATE TYPE "PortType" AS ENUM ('SEA', 'AIR');

-- CreateEnum
CREATE TYPE "DirectionType" AS ENUM ('ARRIVAL', 'DEPARTURE');

-- CreateEnum
CREATE TYPE "VesselType" AS ENUM ('SHIP', 'PLANE', 'OTHER');

-- CreateTable
CREATE TABLE "Port" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "port" TEXT NOT NULL,
    "type" "PortType" NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VesselInfo" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bookingId" TEXT NOT NULL,
    "portId" TEXT NOT NULL,
    "direction" "DirectionType" NOT NULL,
    "type" "VesselType" NOT NULL,
    "carrier" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "arrival" TIMESTAMP(3),
    "departure" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "VesselInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Port" ADD CONSTRAINT "Port_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VesselInfo" ADD CONSTRAINT "VesselInfo_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VesselInfo" ADD CONSTRAINT "VesselInfo_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
