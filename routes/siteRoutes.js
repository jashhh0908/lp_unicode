import express from "express";
import { createUser, deleteUser, getUser, updateUser } from "../controllers/siteController.js";
import { login, register } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/create', createUser);
router.get('/read', authMiddleware, getUser);
router.patch('/update/:email', updateUser);
router.delete('/delete/:email', deleteUser);

router.post('/register', register);
router.post('/login', login);

export default router;