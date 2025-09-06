import express from "express";
import { createUser, deleteUser, getUser, updateUser } from "../controllers/siteController.js";
import { register } from "../controllers/authController.js";
const router = express.Router();

router.post('/create', createUser);
router.get('/read', getUser);
router.patch('/update/:email', updateUser);
router.delete('/delete/:email', deleteUser);

router.post('/register', register);
export default router;