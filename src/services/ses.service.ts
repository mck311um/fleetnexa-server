import {
  SendTemplatedEmailCommand,
  CreateTemplateCommand,
  CreateTemplateCommandInput,
  TestRenderTemplateCommand,
  UpdateTemplateCommandInput,
  UpdateTemplateCommand,
} from '@aws-sdk/client-ses';
import { sesClient } from '../config/aws.config';
import {
  BookingCompletedEmailParams,
  BookingConfirmationEmailParams,
  EmailTemplateParams,
  SendEmailParams,
  VerifyBusinessEmailParams,
  WelcomeEmailParams,
} from '../types/email';
import {
  generateTextFromHtml,
  readTemplateFile,
} from '../utils/template-reader';
import { logger } from '../config/logger';

const testRenderEmailTemplate = async (
  templateName: string,
  templateData:
    | WelcomeEmailParams
    | BookingConfirmationEmailParams
    | BookingCompletedEmailParams
    | VerifyBusinessEmailParams,
) => {
  try {
    const command = new TestRenderTemplateCommand({
      TemplateName: templateName,
      TemplateData: JSON.stringify(templateData),
    });
    const response = await sesClient.send(command);
    return response;
  } catch (error) {
    logger.e(error, `Failed to test render template: ${templateName}`);
    throw error;
  }
};

const sendEmail = async (params: SendEmailParams) => {
  const {
    to,
    cc = [],
    template,
    templateData,
    from = 'no-reply@fleetnexa.com',
  } = params;

  try {
    await testRenderEmailTemplate(template, templateData);

    const command = new SendTemplatedEmailCommand({
      Destination: {
        ToAddresses: to,
        CcAddresses: cc,
      },
      Template: template,
      TemplateData: JSON.stringify(templateData),
      Source: from,
    });

    await sesClient.send(command);
    logger.i(`Email sent successfully to: ${to.join(', ')}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    logger.e(error, 'Failed to send email:');
    throw error;
  }
};

const createEmailTemplate = async (
  templateParams: EmailTemplateParams,
): Promise<boolean> => {
  const { name, subject, text } = templateParams;

  try {
    const html = readTemplateFile(name);

    const templateConfig: CreateTemplateCommandInput = {
      Template: {
        TemplateName: name,
        SubjectPart: subject,
        HtmlPart: html,
        TextPart: text || generateTextFromHtml(html),
      },
    };

    const command = new CreateTemplateCommand(templateConfig);
    await sesClient.send(command);

    logger.i(`Email template created successfully: ${name}`);
    return true;
  } catch (error) {
    logger.e(error, `Failed to create template ${name}:`);
    throw error;
  }
};

const updateEmailTemplate = async (
  templateParams: EmailTemplateParams,
): Promise<boolean> => {
  const { name, subject, text } = templateParams;

  try {
    const html = readTemplateFile(name);

    const templateConfig: UpdateTemplateCommandInput = {
      Template: {
        TemplateName: name,
        SubjectPart: subject,
        HtmlPart: html,
        TextPart: text || generateTextFromHtml(html),
      },
    };

    const command = new UpdateTemplateCommand(templateConfig);
    await sesClient.send(command);

    logger.i(`Email template updated successfully: ${name}`);
    return true;
  } catch (error) {
    logger.e(error, `Failed to update template ${name}:`);
    throw error;
  }
};

const createOrUpdateEmailTemplate = async (
  templateParams: EmailTemplateParams,
): Promise<boolean> => {
  const { name } = templateParams;

  try {
    const updated = await updateEmailTemplate(templateParams);
    if (updated) {
      logger.i(`Template ${name} updated successfully`);
      return true;
    }
  } catch (error: any) {
    if (
      error.name === 'TemplateDoesNotExistException' ||
      error.Error?.Code === 'TemplateDoesNotExist'
    ) {
      logger.i(`Template ${name} doesn't exist, creating it...`);
      return await createEmailTemplate(templateParams);
    }
    throw error;
  }

  return await createEmailTemplate(templateParams);
};

export default {
  sendEmail,
  createEmailTemplate,
  updateEmailTemplate,
  createOrUpdateEmailTemplate,
};
