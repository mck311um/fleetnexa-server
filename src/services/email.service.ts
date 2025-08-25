import {
  SESClient,
  SendTemplatedEmailCommand,
  CreateTemplateCommand,
  CreateTemplateCommandInput,
  TestRenderTemplateCommand,
  UpdateTemplateCommandInput,
  UpdateTemplateCommand,
} from "@aws-sdk/client-ses";
import { sesClient } from "../config/aws.config";
import { EmailTemplateParams, SendEmailParams } from "../types/email";
import { logger } from "../config/logger.config";
import {
  generateTextFromHtml,
  readTemplateFile,
} from "../utils/template-reader";

const testRenderEmailTemplate = async (
  templateName: string,
  templateData: any
) => {
  try {
    const command = new TestRenderTemplateCommand({
      TemplateName: templateName,
      TemplateData: JSON.stringify(templateData),
    });
    const response = await sesClient.send(command);
    return response;
  } catch (error) {
    logger.error(`Failed to test render template: ${templateName}`, error);
    throw error;
  }
};

const sendEmail = async (params: SendEmailParams) => {
  const {
    to,
    template,
    templateData,
    from = "no-reply@fleetnexa.com",
  } = params;

  try {
    await testRenderEmailTemplate(template, templateData);

    const command = new SendTemplatedEmailCommand({
      Destination: {
        ToAddresses: to,
      },
      Template: template,
      TemplateData: JSON.stringify(templateData),
      Source: from,
    });

    await sesClient.send(command);
    logger.info(`Email sent successfully to: ${to.join(", ")}`);
    return true;
  } catch (error) {
    logger.error("Failed to send email:", error);
    throw error;
  }
};

const createEmailTemplate = async (
  templateParams: EmailTemplateParams
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

    logger.info(`Email template created successfully: ${name}`);
    return true;
  } catch (error) {
    logger.error(`Failed to create template ${name}:`, error);
    throw error;
  }
};

const updateEmailTemplate = async (
  templateParams: EmailTemplateParams
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

    logger.info(`Email template updated successfully: ${name}`);
    return true;
  } catch (error: any) {
    if (
      error.name === "TemplateDoesNotExistException" ||
      error.Error?.Code === "TemplateDoesNotExist"
    ) {
      logger.info(`Template ${name} doesn't exist in SES, will create it`);
      return false;
    }

    logger.error(`Failed to update template ${name}:`, error);
    throw error;
  }
};

const createOrUpdateEmailTemplate = async (
  templateParams: EmailTemplateParams
): Promise<boolean> => {
  const { name } = templateParams;

  try {
    const updated = await updateEmailTemplate(templateParams);
    if (updated) {
      logger.info(`Template ${name} updated successfully`);
      return true;
    }

    logger.info(`Template ${name} doesn't exist, creating it...`);
    return await createEmailTemplate(templateParams);
  } catch (error) {
    logger.error(
      `Failed to create or update template ${templateParams.name}:`,
      error
    );
    throw error;
  }
};

export default {
  sendEmail,
  createEmailTemplate,
  updateEmailTemplate,
  createOrUpdateEmailTemplate,
};
