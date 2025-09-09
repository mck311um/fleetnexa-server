import express from 'express';
import controller from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', controller.register);
router.post('/register/storefront', controller.storefrontRegister);
router.post('/login', controller.login);
router.post('/login/storefront', controller.storefrontLogin);

export default router;
