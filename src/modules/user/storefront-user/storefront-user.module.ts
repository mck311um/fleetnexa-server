import { Module } from "@nestjs/common";
import { StorefrontUserController } from "./storefront-user.controller.js";
import { StorefrontUserService } from "./storefront-user.service.js";
import { StorefrontGuard } from "../../../common/guards/storefront.guard.js";

@Module({
	imports: [],
	controllers: [StorefrontUserController],
	providers: [StorefrontUserService, StorefrontGuard],
	exports: [StorefrontUserService],
})
export class StorefrontUserModule {}
