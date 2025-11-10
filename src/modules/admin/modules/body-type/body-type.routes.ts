import express from 'express';
import multer from 'multer';
import controller from './body-type.controller';
import { admin } from '../../../../middleware/admin.middleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', admin, controller.getVehicleBodyTypes);
router.post('/', admin, controller.createVehicleBodyType);
router.put('/', admin, controller.updateVehicleBodyType);
router.delete('/:id', admin, controller.deleteVehicleBodyType);
router.post(
  '/bulk',
  admin,
  upload.single('file'),
  controller.bulkInsertVehicleBodyTypes,
);

export default router;
