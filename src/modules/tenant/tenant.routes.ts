import express from 'express';
import controller from './tenant.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getCurrentTenant);
router.get('/violations', auth, controller.getViolations);
router.get('/:id', auth, controller.getTenantById);

router.post('/', controller.createTenant);
router.post('/violation', auth, controller.createViolation);

router.put('/', auth, controller.updateTenant);
router.put('/violation', auth, controller.updateViolation);

export default router;
