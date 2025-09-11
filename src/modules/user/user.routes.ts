import express from 'express';
import controller from './user.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getSystemUsers);
router.get('/me', auth, controller.getCurrentUser);

router.post('/', auth, controller.createSystemUser);
router.post('/reset/:id', controller.resetUserPassword);

router.put('/', auth, controller.updateSystemUser);

router.patch('/password', auth, controller.changePassword);

router.delete('/:id', auth, controller.deleteUser);

export default router;
