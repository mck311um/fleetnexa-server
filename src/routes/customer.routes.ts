import express from "express";
import controller from "../controllers/customer.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", auth, controller.getCustomers);
router.get("/:id", auth, controller.getCustomerById);

router.post("/", auth, controller.addCustomer);
router.post("/document", auth, controller.addCustomerDocument);

router.put("/", auth, controller.updateCustomer);

router.delete("/:id", auth, controller.deleteCustomer);

export default router;
