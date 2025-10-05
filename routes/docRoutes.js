import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createDocument, getDocument, updateDocument } from '../controllers/docController.js';
const router = express.Router();

router.post('/create', authMiddleware, createDocument);
router.get('/read', authMiddleware, getDocument);
router.patch('/update/:id', authMiddleware, updateDocument);

export default router;