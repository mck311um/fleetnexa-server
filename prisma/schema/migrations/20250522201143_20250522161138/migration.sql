-- CreateTable
CREATE TABLE "CaribbeanCountries" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "countryId" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "CaribbeanCountries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CaribbeanCountries" ADD CONSTRAINT "CaribbeanCountries_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
