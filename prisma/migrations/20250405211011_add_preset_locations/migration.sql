-- CreateTable
CREATE TABLE "PresetLocation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "locationName" TEXT NOT NULL,
    "locationAddress" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "PresetLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PresetLocation" ADD CONSTRAINT "PresetLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
