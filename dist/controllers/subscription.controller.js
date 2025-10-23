"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const addFeatures = async (req, res, next) => {
    const { plan } = req.body;
    const { planName } = req.body;
    if (!planName) {
        return res.status(400).json({ error: 'Plan name is required' });
    }
    if (!plan || plan.length === 0) {
        return res.status(400).json({ error: 'Features are required' });
    }
    try {
        const planRecord = await prisma_config_1.default.subscriptionPlan.findUnique({
            where: { name: planName },
        });
        if (!planRecord) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        const planId = planRecord.id;
        await prisma_config_1.default.$transaction(async (tx) => {
            await tx.planFeatures.deleteMany({
                where: {
                    planId: planId,
                },
            });
            await tx.planFeatures.createMany({
                data: plan.map((feature) => ({
                    feature,
                    planId,
                })),
            });
        });
        return res.status(201).json({ message: 'Features updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
const addFeaturesBulk = async (req, res, next) => {
    const { plans } = req.body;
    if (!plans || !Array.isArray(plans) || plans.length === 0) {
        return res.status(400).json({ error: 'Plans are required' });
    }
    try {
        await prisma_config_1.default.$transaction(async (tx) => {
            for (const { planName, plan } of plans) {
                const planRecord = await tx.subscriptionPlan.findUnique({
                    where: { name: planName },
                });
                if (!planRecord)
                    continue;
                const planId = planRecord.id;
                await tx.planFeatures.deleteMany({ where: { planId } });
                await tx.planFeatures.createMany({
                    data: plan.map((feature) => ({
                        feature,
                        planId,
                    })),
                });
            }
        });
        return res
            .status(201)
            .json({ message: 'All plan features updated successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    addFeatures,
    addFeaturesBulk,
};
