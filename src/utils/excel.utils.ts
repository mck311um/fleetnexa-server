/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
export const validateExcelColumns = (
  data: any[],
  requiredColumns: string[],
): { valid: boolean; missingColumns?: string[] } => {
  if (data.length === 0) {
    return { valid: false, missingColumns: [] };
  }

  const headers = Object.keys(data[0] ?? {}).map((h) => h.toLowerCase());
  const missingColumns = requiredColumns.filter(
    (col) => !headers.includes(col.toLowerCase()),
  );

  return { valid: missingColumns.length === 0, missingColumns };
};
