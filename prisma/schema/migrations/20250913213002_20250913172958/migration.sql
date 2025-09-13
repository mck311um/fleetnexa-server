/*
  Warnings:

  - You are about to drop the `Violation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Violation";

-- CreateTable
CREATE TABLE "public"."CustomerViolation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "violationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "CustomerViolation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CustomerViolation" ADD CONSTRAINT "CustomerViolation_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "public"."TenantViolation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
