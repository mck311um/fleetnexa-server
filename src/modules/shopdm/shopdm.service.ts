import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

const verifySignature = (req: Request) => {
  try {
    const signature = req.headers["x-shopdm-signature"];
    const payload = req.body;

    const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
  } catch (error) {}
};
