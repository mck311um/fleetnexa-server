import express from 'express';
import controller from './tenant-user.controller';

const router = express.Router();

router.post('/forgot-password', controller.requestPassword);
router.post('/verify-email', controller.verifyEmailToken);
router.post('/change-password', controller.changePassword);

export default router;
