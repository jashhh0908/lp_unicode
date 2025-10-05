import express from "express";
import { uploadProfileImage } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = express.Router();

router.post('/upload', authMiddleware, upload.single('profile'), uploadProfileImage);

export default router;