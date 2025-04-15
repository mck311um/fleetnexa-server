/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `CustomerDocument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CustomerDocument_customerId_key" ON "CustomerDocument"("customerId");
