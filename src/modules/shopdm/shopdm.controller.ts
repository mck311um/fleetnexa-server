import { Request } from 'express';
import { logger } from '../../config/logger';

const handlePayment = (req: Request) => {
  try {
    logger.i('Received ShopDM payment webhook', { body: req.body });
  } catch (error) {
    logger.e(error, 'Error handling ShopDM payment webhook');
  }
};

export default {
  handlePayment,
};
