/*
  Warnings:

  - You are about to drop the `_CustomerToMessengerApp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CustomerToMessengerApp" DROP CONSTRAINT "_CustomerToMessengerApp_A_fkey";

-- DropForeignKey
ALTER TABLE "_CustomerToMessengerApp" DROP CONSTRAINT "_CustomerToMessengerApp_B_fkey";

-- DropTable
DROP TABLE "_CustomerToMessengerApp";

-- CreateTable
CREATE TABLE "CustomerMessengerApp" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "customerId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerMessengerApp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomerMessengerApp" ADD CONSTRAINT "CustomerMessengerApp_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMessengerApp" ADD CONSTRAINT "CustomerMessengerApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "MessengerApp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
