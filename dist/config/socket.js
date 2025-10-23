"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
function setupSocket(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.user = decoded.user;
            return next();
        }
        catch (error) {
            logger_1.logger.e(error, 'Socket authentication failed');
            return next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        console.log('✅ Socket connected for user:', user);
        socket.join(user.tenantId);
        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected for user:', user.id);
        });
    });
}
exports.default = setupSocket;
