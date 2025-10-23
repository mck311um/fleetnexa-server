import express from 'express';
import controller from './refund.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getRefunds);

router.post('/', auth, controller.createRefund);

router.put('/', auth, controller.updateRefund);

router.delete('/:id', auth, controller.deleteRefund);

export default router;
