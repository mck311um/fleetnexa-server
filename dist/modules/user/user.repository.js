"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepo = void 0;
const prisma_config_1 = __importDefault(require("../../config/prisma.config"));
class UserRepository {
    constructor() {
        this.getUsers = async (tenantId, additionalWhere) => {
            return await prisma_config_1.default.user.findMany({
                where: { tenantId, ...additionalWhere, isDeleted: false, show: true },
                select: this.getUserSelectOptions(),
            });
        };
        this.getUserById = async (id) => {
            return await prisma_config_1.default.user.findUnique({
                where: { id },
                select: this.getUserSelectOptions(),
            });
        };
    }
    getUserSelectOptions() {
        return {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            tenantId: true,
            createdAt: true,
            email: true,
            roleId: true,
            requirePasswordChange: true,
            role: {
                include: {
                    rolePermission: {
                        include: {
                            permission: true,
                        },
                    },
                },
            },
        };
    }
}
exports.userRepo = new UserRepository();
