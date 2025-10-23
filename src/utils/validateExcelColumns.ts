import { Response } from 'express';

export const validateExcelColumns = (
  data: any[],
  requiredColumns: string[],
  res: Response,
  logger: any,
): boolean => {
  if (data.length === 0) {
    logger.w('Empty Excel file uploaded');
    res.status(400).json({ message: 'The uploaded file is empty' });
    return false;
  }

  const headers = Object.keys(data[0] ?? {}).map((h) => h.toLowerCase());
  const missingColumns = requiredColumns.filter(
    (col) => !headers.includes(col.toLowerCase()),
  );

  if (missingColumns.length > 0) {
    logger.w(`Missing columns: ${missingColumns.join(', ')}`);
    res.status(400).json({
      message: `Missing required columns: ${missingColumns.join(', ')}`,
    });
    return false;
  }

  return true;
};
