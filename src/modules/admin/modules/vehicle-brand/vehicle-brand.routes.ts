import express from 'express';
import multer from 'multer';
import controller from './vehicle-brand.controller';
import { admin } from '../../../../middleware/admin.middleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', admin, controller.getVehicleBrands);
router.post('/', admin, controller.createVehicleBrand);
router.put('/', admin, controller.updateVehicleBrand);
router.delete('/:id', admin, controller.deleteVehicleBrand);
router.post(
  '/bulk',
  admin,
  upload.single('file'),
  controller.bulkAddVehicleBrands,
);

export default router;
