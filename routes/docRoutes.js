import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createDocument, getDocument, updateDocument, deleteDocument, requestAccess, approveRequest, addUserAccess, getDocHistory, restoreVersion } from '../controllers/docController.js';
const router = express.Router();

router.post('/create', authMiddleware, createDocument);
router.get('/read', authMiddleware, getDocument);
router.patch('/update/:id', authMiddleware, updateDocument);
router.delete('/delete/:id', authMiddleware, deleteDocument);
router.post('/request-access/:id', authMiddleware, requestAccess);
router.patch('/approve-request/:id', authMiddleware, approveRequest);
router.patch('/add-user-access/:id', authMiddleware, addUserAccess);
router.get('/:id/history', authMiddleware, getDocHistory)
router.patch('/:id/restore/:versionID', authMiddleware, restoreVersion)
export default router;