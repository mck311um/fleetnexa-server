import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
	imports: [
		JwtModule.registerAsync({
			global: true,
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>("JWT_SECRET"),
				signOptions: { expiresIn: "7d" },
			}),
			inject: [ConfigService],
		}),
	],
})
export class AuthModule {}
