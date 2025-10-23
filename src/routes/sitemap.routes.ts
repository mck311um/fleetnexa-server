import express from 'express';
import controller from '../controllers/sitemap.controller';

const router = express.Router();

router.get('/sitemap', controller.getSitemap);

export default router;
