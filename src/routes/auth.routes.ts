import express from "express";
import controller from "../controllers/auth.controller";
import cors from "cors";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

// router.use(
//   cors({
//     credentials: true,
//     origin: allowedOrigins,
//   })
// );

router.post("/register", controller.register);
router.post("/login", controller.login);

export default router;
