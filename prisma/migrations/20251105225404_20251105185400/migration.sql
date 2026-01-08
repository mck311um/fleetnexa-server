/*
  Warnings:

  - A unique constraint covering the columns `[bodyType]` on the table `VehicleBodyType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[brand]` on the table `VehicleBrand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[model,brandId]` on the table `VehicleModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VehicleBodyType_bodyType_key" ON "VehicleBodyType"("bodyType");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBrand_brand_key" ON "VehicleBrand"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_model_brandId_key" ON "VehicleModel"("model", "brandId");
