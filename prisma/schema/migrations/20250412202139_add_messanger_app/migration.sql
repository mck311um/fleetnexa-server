-- CreateTable
CREATE TABLE "MessengerApp" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "app" TEXT NOT NULL,

    CONSTRAINT "MessengerApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomerToMessengerApp" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomerToMessengerApp_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CustomerToMessengerApp_B_index" ON "_CustomerToMessengerApp"("B");

-- AddForeignKey
ALTER TABLE "_CustomerToMessengerApp" ADD CONSTRAINT "_CustomerToMessengerApp_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerToMessengerApp" ADD CONSTRAINT "_CustomerToMessengerApp_B_fkey" FOREIGN KEY ("B") REFERENCES "MessengerApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
