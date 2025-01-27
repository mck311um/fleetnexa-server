import express from "express";
import cors from "cors";
import * as controller from "../controllers/user";
import requireAuth from "../middleware/requireAuth";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.post("/login", async (req, res) => {
  const { tenantCode, username, password } = req.body;

  try {
    const { data, token } = await controller.loginUser(username, password);
    res.json({ user: data, token });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/create", async (req, res) => {
  const { tenantCode, firstName, lastName, password, username } = req.body;

  try {
    const user = await controller.createUser(
      tenantCode,
      firstName,
      lastName,
      password,
      username
    );
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
