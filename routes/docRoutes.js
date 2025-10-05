import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createDocument } from '../controllers/docController.js';
const router = express.Router();

router.post('/create', authMiddleware, createDocument);

export default router;