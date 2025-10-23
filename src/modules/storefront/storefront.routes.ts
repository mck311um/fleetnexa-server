import express from 'express';
import controller from './storefront.controller';
import { api } from '../../middleware/api.middleware';

const router = express.Router();

router.get('/tenants', api, controller.getTenants);
router.get('/tenant/:slug', api, controller.getTenantBySlug);

router.get('/vehicles', api, controller.getVehicles);
router.get('/vehicle/:id', api, controller.getVehicleById);

export default router;
