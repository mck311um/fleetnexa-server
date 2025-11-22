import express from 'express';
import controller from './storefront.controller';

const router = express.Router();

router.post('/create', controller.createUser);
router.post('/login', controller.loginUser);
router.post('/forgot-password', controller.requestPasswordReset);
router.post('/verify-code', controller.verifyPasswordResetToken);
router.post('/reset-password', controller.resetPassword);

export default router;
