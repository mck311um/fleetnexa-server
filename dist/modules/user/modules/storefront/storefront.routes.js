"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storefront_controller_1 = __importDefault(require("./storefront.controller"));
const storefront_middleware_1 = require("../../../../middleware/storefront.middleware");
const router = express_1.default.Router();
router.get('/me', storefront_middleware_1.storefrontAuth, storefront_controller_1.default.getCurrentUser);
router.get('/bookings', storefront_middleware_1.storefrontAuth, storefront_controller_1.default.getPreviousBookings);
router.put('/', storefront_middleware_1.storefrontAuth, storefront_controller_1.default.updateStorefrontUser);
router.patch('/change-password', storefront_middleware_1.storefrontAuth, storefront_controller_1.default.changePassword);
exports.default = router;
