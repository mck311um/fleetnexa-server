import express from 'express';
import controller from './user-role.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getUserRole);
router.get('/roles', auth, controller.getRoles);

router.post('/', auth, controller.addUserRole);

router.put('/', auth, controller.updateRole);

router.delete('/:id', auth, controller.deleteRole);
export default router;
