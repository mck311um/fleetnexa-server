import { readFileSync } from "fs";
import { join } from "path";
import { logger } from "../config/logger.config";

const TEMPLATES_DIR = join(__dirname, "../templates");

export const readTemplateFile = (templateName: string): string => {
  try {
    const filePath = join(TEMPLATES_DIR, `${templateName}.html`);
    const templateContent = readFileSync(filePath, "utf-8");
    return templateContent;
  } catch (error) {
    logger.error(`Failed to read template file: ${templateName}`, error);
    throw new Error(`Template file not found: ${templateName}`);
  }
};

export const generateTextFromHtml = (html: string): string => {
  return html
    .replace(/<head>.*<\/head>/s, "")
    .replace(/<style>.*<\/style>/s, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
};
