"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const Sentry = __importStar(require("@sentry/node"));
if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: 'production',
        tracesSampleRate: 1.0,
        sendDefaultPii: true,
    });
}
const transport = process.env.NODE_ENV === 'development'
    ? pino_1.default.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
    })
    : undefined;
const pinoLogger = transport
    ? (0, pino_1.default)({
        level: process.env.LOG_LEVEL || 'info',
        timestamp: pino_1.default.stdTimeFunctions.isoTime,
    }, transport)
    : (0, pino_1.default)({
        level: process.env.LOG_LEVEL || 'info',
        timestamp: pino_1.default.stdTimeFunctions.isoTime,
    });
exports.logger = {
    i: (message, meta) => {
        pinoLogger.info(meta || {}, message);
    },
    w: (message, meta) => {
        pinoLogger.warn(meta || {}, message);
    },
    e: (error, message = 'Error occurred', meta) => {
        pinoLogger.error({ err: error, ...meta }, message);
        if (process.env.NODE_ENV === 'production') {
            Sentry.captureException(error instanceof Error ? error : new Error(String(error)), { extra: meta });
        }
    },
};
