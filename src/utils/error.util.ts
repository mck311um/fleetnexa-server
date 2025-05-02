import { Request, Response } from "express";

const handleError = (res: Response, error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  return res.status(500).json({
    error: "Internal server error",
    details: error instanceof Error ? error.message : undefined,
  });
};

export default {
  handleError,
};
