import express from 'express';
import controller from './signing.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/agreement', auth, controller.sendAgreementForSigning);

export default router;
