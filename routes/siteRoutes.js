import express from "express";
import { createUser, getUser, updateUser } from "../controllers/siteController.js";
const router = express.Router();

router.post('/create', createUser);
router.get('/read', getUser);
router.patch('/update/:email', updateUser);

export default router;