import express from 'express';
import multer from 'multer';
import controller from './vehicle-model.controller';
import { admin } from '../../../../middleware/admin.middleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', admin, controller.getVehicleModels);
router.post('/', admin, controller.createVehicleModel);
router.put('/', admin, controller.updateVehicleModel);
router.delete('/:id', admin, controller.deleteVehicleModel);
router.post(
  '/bulk',
  admin,
  upload.single('file'),
  controller.bulkInsertVehicleModels,
);

export default router;
