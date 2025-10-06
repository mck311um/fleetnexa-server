import express from 'express';
import controller from './admin.controller';
import { auth } from '../../middleware/auth.middleware';
import { countriesController } from './modules/countries.controller';
import { admin } from '../../middleware/admin.middleware';

const router = express.Router();

router.get('/', controller.getAdminData);
router.get('/countries', admin, countriesController.getCountries);

export default router;
