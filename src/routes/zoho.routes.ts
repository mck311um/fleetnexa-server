import express from "express";
import controller from "../controllers/zoho.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/sign", auth, controller.sendForSignature);

export default router;
