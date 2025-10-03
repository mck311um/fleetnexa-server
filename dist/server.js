"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const socket_1 = __importDefault(require("./config/socket"));
const logger_1 = require("./config/logger");
const PORT = process.env.PORT || 5001;
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            'https://app.fleetnexa.com',
            'https://dev.app.fleetnexa.com',
            'http://localhost:5173',
        ],
        credentials: true,
    },
});
app_1.default.set('io', io);
(0, socket_1.default)(io);
server.listen(PORT, () => {
    logger_1.logger.i(`Server running on port ${PORT}`);
});
