import express from 'express';
import controller from './admin.controller';
import { countriesController } from './modules/countries.controller';
import { admin } from '../../middleware/admin.middleware';
import { permissionsController } from './modules/permissions.controller';
import { plansController } from './modules/plans.controller';
import { categoryController } from './modules/category.controller';
import multer from 'multer';
import { api } from '../../middleware/api.middleware';
import { vehicleBrandsController } from './modules/vehicle-brands.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.getAdminData);
router.get('/dashboard', admin, controller.dashboardAdminData);
router.get('/storefront', api, controller.getStorefrontAdminData);
router.get('/countries', admin, countriesController.getCountries);
router.get('/permissions', admin, permissionsController.getAppPermissions);
router.get('/categories', admin, categoryController.getPermissionCategories);
router.get('/plans', admin, plansController.getPlans);
router.get('/vehicle-brands', admin, vehicleBrandsController.getVehicleBrands);

router.post('/permissions', admin, permissionsController.addAppPermission);
router.post('/categories', admin, categoryController.addPermissionCategory);
router.post('/vehicle-brands', admin, vehicleBrandsController.addVehicleBrand);

router.put(
  '/vehicle-brands',
  admin,
  vehicleBrandsController.updateVehicleBrand,
);

router.delete(
  '/vehicle-brands/:id',
  admin,
  vehicleBrandsController.deleteVehicleBrand,
);

router.post(
  '/categories/import',
  admin,
  upload.single('file'),
  categoryController.bulkAddPermissionCategories,
);
router.post(
  '/permissions/import',
  admin,
  upload.single('file'),
  permissionsController.bulkAddPermissions,
);
router.post(
  '/vehicle-brands/import',
  admin,
  upload.single('file'),
  vehicleBrandsController.bulkAddVehicleBrands,
);

export default router;
