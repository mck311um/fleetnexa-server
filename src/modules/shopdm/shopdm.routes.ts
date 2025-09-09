import express from "express";
import controller from "./shopdm.controller";
import { auth } from "../../middleware/auth.middleware";
import { api } from "../../middleware/api.middleware";
import bodyParser from "body-parser";

const router = express.Router();

router.post(
  "/webhook ",
  bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }),
  controller.handlePayment
);

export default router;
