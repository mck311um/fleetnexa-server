import express from 'express';
import controller from './admin.controller';
import { countriesController } from './modules/countries.controller';
import { admin } from '../../middleware/admin.middleware';
import { permissionsController } from './modules/permissions.controller';
import { plansController } from './modules/plans.controller';
import { categoryController } from './modules/category.controller';

const router = express.Router();

router.get('/', controller.getAdminData);
router.get('/dashboard', admin, controller.dashboardAdminData);
router.get('/countries', admin, countriesController.getCountries);
router.get('/permissions', admin, permissionsController.getAppPermissions);
router.get('/categories', admin, categoryController.getPermissionCategories);
router.get('/plans', admin, plansController.getPlans);

router.post('/permissions', admin, permissionsController.addAppPermission);
router.post('/categories', admin, categoryController.addPermissionCategory);

export default router;
