"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = __importDefault(require("../controllers/subscription.controller"));
const router = express_1.default.Router();
router.post('/:planId/features', subscription_controller_1.default.addFeatures);
router.post('/features/bulk', subscription_controller_1.default.addFeaturesBulk);
exports.default = router;
