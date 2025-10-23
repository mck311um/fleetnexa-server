import express from 'express';
import controller from './auth.controller';

const router = express.Router();

router.post('/tenant/login', controller.tenantLogin);

router.post('/admin/login', controller.adminUserLogin);
router.post('/admin/create', controller.createAdminUser);

router.post('/storefront/create', controller.createStorefrontUser);
router.post('/storefront/login', controller.loginStorefrontUser);

export default router;
