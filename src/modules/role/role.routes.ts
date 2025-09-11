import express from 'express';
import controller from './role.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getUserRole);
router.get('/roles', auth, controller.getRoles);

router.delete('/:id', auth, controller.deleteRole);
export default router;
