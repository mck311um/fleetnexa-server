import { Module } from "@nestjs/common";
import { StorefrontAuthController } from "./storefront-auth.controller.js";
import { StorefrontAuthService } from "./storefront-auth.service.js";

@Module({
	imports: [],
	controllers: [StorefrontAuthController],
	providers: [StorefrontAuthService],
	exports: [StorefrontAuthService],
})
export class StorefrontAuthModule {}
