import express from 'express';
import controller from './auth.controller';

const router = express.Router();

router.post('/tenant/login', controller.tenantLogin);

router.post('/admin/login', controller.adminUserLogin);
router.post('/admin/create', controller.createAdminUser);

router.post('/storefront/create', controller.createStorefrontUser);
router.post('/storefront/login', controller.loginStorefrontUser);
router.post(
  '/storefront/forgot-password',
  controller.requestStorefrontPasswordReset,
);
router.post(
  '/storefront/verify-code',
  controller.verifyStorefrontPasswordResetToken,
);
router.post('/storefront/reset-password', controller.resetStorefrontPassword);

export default router;
