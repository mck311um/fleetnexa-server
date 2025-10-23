import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger';
import ses from '../../services/ses.service';
import { templates } from '../../config/templates';
import { SendBookingDocumentsSchema } from './email.dto';
import { emailService } from './email.service';

const setupTemplates = async (req: Request, res: Response) => {
  try {
    const results = [];

    for (const template of templates) {
      try {
        logger.i(`Setting up template: ${template.name}`);
        const success = await ses.createOrUpdateEmailTemplate(template);

        results.push({
          template: template.name,
          success: success,
          message: success
            ? 'Template setup complete'
            : 'Template setup failed',
        });

        if (success) {
          logger.i(`✓ ${template.name} template setup complete`);
        } else {
          logger.i(`✗ ${template.name} template setup failed`);
        }
      } catch (error: unknown) {
        logger.e(error, `Failed to setup ${template.name}:`);
        results.push({
          template: template.name,
          success: false,
          message: `Error: ${(error as Error).message}`,
        });
      }
    }

    res.status(200).json({
      message: 'Template setup completed',
      results: results,
    });
  } catch (error) {
    logger.e(error, 'Template setup endpoint failed:');
  }
};

const sendBookingDocumentsEmail = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant } = req.context!;

  const safeParse = SendBookingDocumentsSchema.safeParse(data);
  if (!safeParse.success) {
    logger.w('Invalid request data for sending booking documents email', {
      errors: safeParse.error.issues,
      data,
    });
    return res.status(400).json({ errors: safeParse.error.issues });
  }

  const emailDto = safeParse.data;

  try {
    await emailService.sendBookingDocumentsEmail(emailDto, tenant);

    return res
      .status(200)
      .json({ message: 'Booking documents email sent successfully' });
  } catch (error) {
    logger.e(error, 'Failed to send booking documents email:');
    return res.status(500).json({ message: 'Failed to send email' });
  }
};

export default {
  setupTemplates,
  sendBookingDocumentsEmail,
};
