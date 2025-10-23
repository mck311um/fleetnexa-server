import express from 'express';
import controller from './shopdm.controller';

const router = express.Router();

router.post(
  '/webhook ',

  controller.handlePayment,
);

export default router;
