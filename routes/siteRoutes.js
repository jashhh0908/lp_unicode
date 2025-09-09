import express from "express";
import { createUser, deleteUser, getUser, updateUser } from "../controllers/siteController.js";
import { login, logout, refreshAccessToken, register } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/create', createUser);
router.get('/read', authMiddleware, getUser);
router.patch('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken)
router.post('/logout', logout)

export default router;