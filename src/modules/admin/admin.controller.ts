import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service.js";
import { ApiGuard } from "../../common/guards/api.guard.js";

@Controller("admin")
export class AdminController {
	constructor(private readonly service: AdminService) {}

	@Get()
	async getAdminData() {
		return this.service.getClientData();
	}

	@Get("storefront")
	@UseGuards(ApiGuard)
	async getStorefrontData() {
		return this.service.getStorefrontData();
	}
}
