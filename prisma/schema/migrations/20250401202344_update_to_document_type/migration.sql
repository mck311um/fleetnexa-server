/*
  Warnings:

  - You are about to drop the `IdentificationDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomerDocument" DROP CONSTRAINT "CustomerDocument_documentId_fkey";

-- DropTable
DROP TABLE "IdentificationDocument";

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
