import express from 'express';
import { chatbot } from '../controllers/chatbotController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/post/:id', authMiddleware, chatbot);

export default router;