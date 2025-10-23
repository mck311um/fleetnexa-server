"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
const prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});
prisma.$on('error', (e) => {
    logger_1.logger.e({ target: e.target }, `Prisma Error: ${e.message}`);
});
prisma.$on('warn', (e) => {
    logger_1.logger.w(`Prisma Warning: ${e.message}`, { target: e.target });
});
exports.default = prisma;
