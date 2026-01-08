-- CreateTable
CREATE TABLE "StorefrontBooking" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "rentalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "StorefrontBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorefrontUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "driverLicenseNumber" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "licenseIssued" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "profilePicture" TEXT DEFAULT 'https://fleetnexa.s3.us-east-1.amazonaws.com/Global+Images/fallback.png',

    CONSTRAINT "StorefrontUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontBooking_rentalId_key" ON "StorefrontBooking"("rentalId");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontUser_email_key" ON "StorefrontUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontUser_phone_key" ON "StorefrontUser"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontUser_driverLicenseNumber_key" ON "StorefrontUser"("driverLicenseNumber");

-- AddForeignKey
ALTER TABLE "StorefrontBooking" ADD CONSTRAINT "StorefrontBooking_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontBooking" ADD CONSTRAINT "StorefrontBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "StorefrontUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorefrontUser" ADD CONSTRAINT "StorefrontUser_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
