import express from "express";
import { createUser, getUser } from "../controllers/siteController.js";
const router = express.Router();

router.post('/create', createUser);
router.get('/read', getUser);

export default router;