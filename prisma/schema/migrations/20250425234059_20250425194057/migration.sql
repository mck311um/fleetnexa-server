-- CreateTable
CREATE TABLE "PaymentType" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PaymentType_pkey" PRIMARY KEY ("id")
);
