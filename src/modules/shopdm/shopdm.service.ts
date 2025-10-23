import { logger } from '../../config/logger';

const verifySignature = () => {
  try {
    // const payload = req.body;
  } catch (error) {
    logger.e(error, 'Error verifying ShopDM signature');
  }
};

export default {
  verifySignature,
};
