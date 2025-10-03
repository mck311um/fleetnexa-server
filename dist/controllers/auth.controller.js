"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const register = async (req, res) => {
    const { username, password, firstName, lastName, tenantId } = req.body;
    try {
        const tenant = await prisma_config_1.default.tenant.findUnique({
            where: { id: tenantId },
        });
        const existingUser = await prisma_config_1.default.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = await prisma_config_1.default.user.create({
            data: {
                username,
                password: hashedPassword,
                firstName,
                lastName,
                tenantId,
                lastChanged: new Date(),
            },
        });
        const userData = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            initials: `${user.firstName[0]}${user.lastName[0]}`,
            fullName: `${user.firstName} ${user.lastName}`,
            tenantId: user.tenantId,
            tenant: tenant?.tenantCode,
        };
        const payload = {
            user: {
                id: user.id,
                tenantId: user.tenantId,
            },
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(201).json({ userData, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
const storefrontRegister = async (req, res, next) => {
    const { account } = req.body;
    try {
        const emailExists = await prisma_config_1.default.storefrontUser.findUnique({
            where: { email: account.email },
        });
        if (emailExists) {
            return res
                .status(400)
                .json({ message: 'Account with this email already exists' });
        }
        const phoneExists = await prisma_config_1.default.storefrontUser.findUnique({
            where: { phone: account.phone },
        });
        if (phoneExists) {
            return res
                .status(400)
                .json({ message: 'Account with this phone number already exists' });
        }
        const licenseExists = await prisma_config_1.default.storefrontUser.findUnique({
            where: { driverLicenseNumber: account.driverLicenseNumber },
        });
        if (licenseExists) {
            return res.status(400).json({
                message: 'Account with this driver license number already exists',
            });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(account.password, salt);
        const user = await prisma_config_1.default.storefrontUser.create({
            data: {
                firstName: account.firstName,
                lastName: account.lastName,
                email: account.email,
                phone: account.phone,
                driverLicenseNumber: account.driverLicenseNumber,
                password: hashedPassword,
                dateOfBirth: account.dateOfBirth,
                gender: account.gender,
                licenseExpiry: account.licenseExpiry,
                licenseIssued: account.licenseIssued,
                street: account.street,
                villageId: account.villageId,
                stateId: account.stateId,
                countryId: account.countryId,
                createdAt: new Date(),
            },
            select: {
                password: false,
            },
        });
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
};
const login = async (req, res, next) => {
    const { username, password, rememberMe } = req.body;
    try {
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: 'Username and password are required' });
        }
        const user = await prisma_config_1.default.user.findUnique({
            where: { username },
            include: {
                tenant: true,
                role: {
                    include: {
                        rolePermission: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const userData = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            initials: `${user.firstName[0]}${user.lastName[0]}`,
            fullName: `${user.firstName} ${user.lastName}`,
            tenantId: user.tenantId,
            tenantCode: user.tenant?.tenantCode,
            roleId: user.roleId,
            requirePasswordChange: user.requirePasswordChange,
        };
        const payload = {
            user: {
                id: user.id,
                tenantId: user.tenantId,
                tenantCode: user.tenant?.tenantCode,
            },
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: rememberMe ? '7d' : '30d',
        });
        res.status(200).json({ userData, token });
    }
    catch (error) {
        next(error);
    }
};
const storefrontLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await prisma_config_1.default.storefrontUser.findUnique({
            where: { email },
        });
        if (!user) {
            return res
                .status(400)
                .json({ message: 'An account with this email does not exist' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Password' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.default = { register, login, storefrontRegister, storefrontLogin };
