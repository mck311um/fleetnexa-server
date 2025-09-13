import express from 'express';
import controller from './tenant.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/violations', auth, controller.getViolations);

router.post('/', controller.createTenant);
router.post('/violation', auth, controller.createViolation);

router.put('/violation', auth, controller.updateViolation);

export default router;
