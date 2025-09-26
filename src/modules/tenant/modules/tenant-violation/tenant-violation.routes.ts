import express from 'express';
import controller from './tenant-violation.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getAllTenantViolations);

router.post('/', auth, controller.createViolation);

router.put('/', auth, controller.updateViolation);

router.delete('/:id', auth, controller.deleteViolation);

export default router;
