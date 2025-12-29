import {
	ConflictException,
	GoneException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service.js";
import { StorefrontAuthDto } from "./storefront-auth.dto.js";
import bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { EmailLoginDto } from "../dto/email-login.dto.js";
import { GeneratorService } from "../../../common/generator/generator.service.js";
import { EmailService } from "../../../common/email/email.service.js";
import { VerifyEmailTokenDto } from "../dto/verify-email-token.dto.js";
import { ResetPasswordDto } from "../dto/reset-password.dto.js";

@Injectable()
export class StorefrontAuthService {
	private readonly logger = new Logger(StorefrontAuthService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly generator: GeneratorService,
		private readonly email: EmailService,
	) {}

	async loginUser(data: EmailLoginDto) {
		try {
			const user = await this.prisma.storefrontUser.findUnique({
				where: { email: data.email },
			});

			if (!user) {
				this.logger.warn("Invalid email or password", { email: data.email });
				throw new NotFoundException("Invalid email or password");
			}

			const isMatch = await bcrypt.compare(data.password, user.password);
			if (!isMatch) {
				this.logger.warn("Invalid email or password", { email: data.email });
				throw new UnauthorizedException("Invalid email or password");
			}

			const userData = {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				initials: `${user.firstName[0]}${user.lastName[0]}`,
				fullName: `${user.firstName} ${user.lastName}`,
				email: user.email,
				driverLicenseNumber: user.driverLicenseNumber,
				licenseExpiry: user.licenseExpiry,
				licenseIssued: user.licenseIssued,
				dateOfBirth: user.dateOfBirth,
			};

			const payload = {
				storefrontUser: { id: user.id },
			};
			const token = this.jwt.sign(payload, {
				expiresIn: data.rememberMe ? "30d" : "7d",
			});

			return { user: userData, token };
		} catch (error) {
			this.logger.error("Error logging in user", { error });
			throw error;
		}
	}

	async createUser(data: StorefrontAuthDto) {
		try {
			const existingUser = await this.prisma.storefrontUser.findUnique({
				where: { email: data.email },
			});

			if (existingUser) {
				this.logger.warn("User with email already exists", {
					email: data.email,
				});
				throw new ConflictException(
					"An account with these credentials already exists.",
				);
			}

			const existingLicense = await this.prisma.storefrontUser.findFirst({
				where: { driverLicenseNumber: data.licenseNumber },
			});

			if (existingLicense) {
				this.logger.warn("User with driver license number already exists", {
					driverLicenseNumber: data.licenseNumber,
				});

				if (existingUser) {
					this.logger.warn("User with email already exists", {
						email: data.email,
					});
					throw new ConflictException(
						"An account with this email already exists.",
					);
				}

				const existingLicense = await this.prisma.storefrontUser.findFirst({
					where: { driverLicenseNumber: data.licenseNumber },
				});

				if (existingLicense) {
					this.logger.warn("User with driver license number already exists", {
						driverLicenseNumber: data.licenseNumber,
					});
					throw new ConflictException(
						"A user with this driver license number already exists.",
					);
				}
			}

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(data.password, salt);

			const user = await this.prisma.storefrontUser.create({
				data: {
					firstName: data.firstName,
					lastName: data.lastName,
					email: data.email,
					gender: data.gender || "male",
					phone: data.phone || "",
					password: hashedPassword,
					driverLicenseNumber: data.licenseNumber,
					licenseExpiry: new Date(data.licenseExpiry),
					licenseIssued: new Date(data.licenseIssued),
					license: data.license,
					dateOfBirth: new Date(data.dateOfBirth),
					street: data.street || "",
					countryId: data.countryId || null,
					stateId: data.stateId || null,
				},
				select: {
					id: true,
					firstName: true,
					lastName: true,
					createdAt: true,
					email: true,
					profilePicture: true,
					driverLicenseNumber: true,
					licenseExpiry: true,
					licenseIssued: true,
					license: true,
					country: true,
					countryId: true,
					street: true,
					village: true,
					villageId: true,
					state: true,
					stateId: true,
					phone: true,
				},
			});

			const userData = {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				initials: `${user.firstName[0]}${user.lastName[0]}`,
				fullName: `${user.firstName} ${user.lastName}`,
				createdAt: user.createdAt,
				email: user.email,
				profilePicture: user.profilePicture || null,
				driverLicenseNumber: user.driverLicenseNumber,
				licenseExpiry: user.licenseExpiry,
				licenseIssued: user.licenseIssued,
				license: user.license,
				country: user.country?.country,
				countryId: user.countryId,
				street: user.street,
				village: user.village?.village,
				villageId: user.villageId,
				state: user.state?.state,
				stateId: user.stateId,
				phone: user.phone,
			};

			const payload = {
				storefrontUser: { id: user.id },
			};
			const token = this.jwt.sign(payload, {
				expiresIn: "7d",
			});

			return { user: userData, token };
		} catch (error) {
			this.logger.error("Error creating user", { error });
			throw error;
		}
	}

	async requestPasswordReset(email: string) {
		try {
			const user = await this.prisma.storefrontUser.findUnique({
				where: { email },
			});

			if (!user) {
				this.logger.warn("Password reset requested for non-existent email", {
					email,
				});
				throw new NotFoundException("No account found with that email.");
			}

			await this.prisma.emailTokens.updateMany({
				where: { email, expired: false },
				data: { expired: true },
			});

			const resetToken = await this.generator.generateVerificationCode();
			const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

			await this.prisma.emailTokens.create({
				data: {
					email,
					token: resetToken,
					expiresAt,
				},
			});

			await this.email.sendStorefrontPasswordResetEmail(resetToken, email);
		} catch (error) {
			this.logger.error(error, "Failed to request password reset", { email });
			throw error;
		}
	}

	async validatePasswordResetToken(data: VerifyEmailTokenDto) {
		try {
			const tokenRecord = await this.prisma.emailTokens.findFirst({
				where: {
					email: data.email,
					token: data.token,
					expired: false,
				},
			});

			if (!tokenRecord) {
				this.logger.warn("Invalid password reset token", data);
				throw new NotFoundException("The password reset token is invalid.");
			}

			const now = new Date();
			if (tokenRecord && tokenRecord.expiresAt < now) {
				await this.prisma.emailTokens.updateMany({
					where: { email: data.email, token: data.token },
					data: { expired: true },
				});
				this.logger.warn("Expired password reset token", data);
				throw new GoneException("The password reset token has expired.");
			}

			await this.prisma.emailTokens.updateMany({
				where: { email: data.email, token: data.token },
				data: { expired: true, verified: true },
			});

			return { message: "Token verified successfully" };
		} catch (error) {
			this.logger.error(error, "Failed to verify password reset token", {
				email: data.email,
				token: data.token,
			});
			throw error;
		}
	}

	async resetPassword(data: ResetPasswordDto) {
		try {
			const hashedPassword = await bcrypt.hash(data.newPassword, 10);
			const user = await this.prisma.storefrontUser.findUnique({
				where: { email: data.email },
			});

			const passwordCompare = await bcrypt.compare(
				data.newPassword,
				user?.password || "",
			);

			if (passwordCompare) {
				throw new ConflictException(
					"New password must be different from the old password",
				);
			}

			await this.prisma.storefrontUser.updateMany({
				where: { email: data.email },
				data: { password: hashedPassword },
			});

			return { message: "Password reset successfully" };
		} catch (error) {
			this.logger.error(error, "Failed to reset storefront password", {
				data,
			});
			throw error;
		}
	}
}
