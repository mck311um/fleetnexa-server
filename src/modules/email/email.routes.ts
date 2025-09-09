import express from 'express';
import controller from './email.controller';

const router = express.Router();

router.post('/', controller.setupTemplates);

// router.post("/booking/confirm/:id", auth, controller.sendConfirmationEmail);

export default router;
