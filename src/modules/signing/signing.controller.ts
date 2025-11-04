import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger';
import { signingService } from './signing.service';
import { SendAgreementForSigningSchema } from './signing.dto';

const sendAgreementForSigning = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant } = req.context!;

  if (!data) {
    res.status(400).json({ message: 'Invalid request data' });
    return res.status(400).json({ error: 'Signing data is required' });
  }

  const parseResult = SendAgreementForSigningSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid agreement signing data',
      details: parseResult.error.issues,
    });
  }

  const signingData = parseResult.data;

  try {
    const signing = await signingService.sendAgreementForSigning(
      signingData,
      tenant,
    );

    res
      .status(200)
      .json({ message: 'Agreement sent for signing', data: signing });
  } catch (error) {
    logger.e(error, 'Error sending document for signing', {
      bookingId: data.bookingId,
      tenantId: tenant.id,
    });
    res.status(500).json({ message: 'Failed to send agreement for signing' });
  }
};

export default {
  sendAgreementForSigning,
};
