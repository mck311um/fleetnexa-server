import express from 'express';
import controller from './admin.controller';
import { auth } from '../../middleware/auth.middleware';
import { countriesController } from './modules/countries.controller';
import { admin } from '../../middleware/admin.middleware';
import { permissionsController } from './modules/permissions.controller';

const router = express.Router();

router.get('/', controller.getAdminData);
router.get('/countries', admin, countriesController.getCountries);
router.get('/permissions', admin, permissionsController.getAppPermissions);

router.post('/permissions', admin, permissionsController.addAppPermission);

export default router;
