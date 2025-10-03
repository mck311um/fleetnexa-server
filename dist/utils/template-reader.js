"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTextFromHtml = exports.readTemplateFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const logger_1 = require("../config/logger");
const TEMPLATES_DIR = (0, path_1.join)(__dirname, '../templates');
const readTemplateFile = (templateName) => {
    try {
        const filePath = (0, path_1.join)(TEMPLATES_DIR, `${templateName}.html`);
        const templateContent = (0, fs_1.readFileSync)(filePath, 'utf-8');
        return templateContent;
    }
    catch (error) {
        logger_1.logger.e(error, `Failed to read template file: ${templateName}`);
        throw new Error(`Template file not found: ${templateName}`);
    }
};
exports.readTemplateFile = readTemplateFile;
const generateTextFromHtml = (html) => {
    return html
        .replace(/<head>.*<\/head>/s, '')
        .replace(/<style>.*<\/style>/s, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
};
exports.generateTextFromHtml = generateTextFromHtml;
