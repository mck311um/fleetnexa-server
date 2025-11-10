/*
  Warnings:

  - A unique constraint covering the columns `[model,brandId,typeId]` on the table `VehicleModel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."VehicleModel_model_brandId_key";

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_model_brandId_typeId_key" ON "VehicleModel"("model", "brandId", "typeId");
