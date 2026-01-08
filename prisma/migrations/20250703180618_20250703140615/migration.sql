-- CreateTable
CREATE TABLE "RentalCharge" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "rentalId" TEXT NOT NULL,
    "charge" TEXT NOT NULL,
    "reason" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RentalCharge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RentalCharge" ADD CONSTRAINT "RentalCharge_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
