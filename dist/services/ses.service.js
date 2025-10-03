"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_ses_1 = require("@aws-sdk/client-ses");
const aws_config_1 = require("../config/aws.config");
const template_reader_1 = require("../utils/template-reader");
const logger_1 = require("../config/logger");
const testRenderEmailTemplate = async (templateName, templateData) => {
    try {
        const command = new client_ses_1.TestRenderTemplateCommand({
            TemplateName: templateName,
            TemplateData: JSON.stringify(templateData),
        });
        const response = await aws_config_1.sesClient.send(command);
        return response;
    }
    catch (error) {
        logger_1.logger.e(error, `Failed to test render template: ${templateName}`);
        throw error;
    }
};
const sendEmail = async (params) => {
    const { to, cc = [], template, templateData, from = 'no-reply@fleetnexa.com', } = params;
    try {
        await testRenderEmailTemplate(template, templateData);
        const command = new client_ses_1.SendTemplatedEmailCommand({
            Destination: {
                ToAddresses: to,
                CcAddresses: cc,
            },
            Template: template,
            TemplateData: JSON.stringify(templateData),
            Source: from,
        });
        await aws_config_1.sesClient.send(command);
        logger_1.logger.i(`Email sent successfully to: ${to.join(', ')}`);
        return true;
    }
    catch (error) {
        console.error('Failed to send email:', error);
        logger_1.logger.e(error, 'Failed to send email:');
        throw error;
    }
};
const createEmailTemplate = async (templateParams) => {
    const { name, subject, text } = templateParams;
    try {
        const html = (0, template_reader_1.readTemplateFile)(name);
        const templateConfig = {
            Template: {
                TemplateName: name,
                SubjectPart: subject,
                HtmlPart: html,
                TextPart: text || (0, template_reader_1.generateTextFromHtml)(html),
            },
        };
        const command = new client_ses_1.CreateTemplateCommand(templateConfig);
        await aws_config_1.sesClient.send(command);
        logger_1.logger.i(`Email template created successfully: ${name}`);
        return true;
    }
    catch (error) {
        logger_1.logger.e(error, `Failed to create template ${name}:`);
        throw error;
    }
};
const updateEmailTemplate = async (templateParams) => {
    const { name, subject, text } = templateParams;
    try {
        const html = (0, template_reader_1.readTemplateFile)(name);
        const templateConfig = {
            Template: {
                TemplateName: name,
                SubjectPart: subject,
                HtmlPart: html,
                TextPart: text || (0, template_reader_1.generateTextFromHtml)(html),
            },
        };
        const command = new client_ses_1.UpdateTemplateCommand(templateConfig);
        await aws_config_1.sesClient.send(command);
        logger_1.logger.i(`Email template updated successfully: ${name}`);
        return true;
    }
    catch (error) {
        logger_1.logger.e(error, `Failed to update template ${name}:`);
        throw error;
    }
};
const createOrUpdateEmailTemplate = async (templateParams) => {
    const { name } = templateParams;
    try {
        const updated = await updateEmailTemplate(templateParams);
        if (updated) {
            logger_1.logger.i(`Template ${name} updated successfully`);
            return true;
        }
        logger_1.logger.i(`Template ${name} doesn't exist, creating it...`);
        return await createEmailTemplate(templateParams);
    }
    catch (error) {
        logger_1.logger.e(error, `Failed to create or update template ${templateParams.name}:`);
        throw error;
    }
};
exports.default = {
    sendEmail,
    createEmailTemplate,
    updateEmailTemplate,
    createOrUpdateEmailTemplate,
};
