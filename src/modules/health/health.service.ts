import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class HealthService {
	private readonly logger = new Logger(HealthService.name);

	constructor(private prisma: PrismaService) {}

	async checkHealth(): Promise<{
		status: string;
		services: any;
		timestamp: string;
	}> {
		try {
			await this.prisma.$queryRaw`SELECT 1`;

			return {
				status: "healthy",
				timestamp: new Date().toISOString(),
				services: {
					database: "connected",
				},
			};
		} catch (error) {
			this.logger.error("Health check failed", error);

			return {
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				services: {
					database: "disconnected",
				},
			};
		}
	}
}
