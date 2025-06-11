import express from "express";
import controller from "../controllers/devvize.controller";

const router = express.Router();

router.post("/app-permission", controller.addAppPermission);

export default router;
