import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createDocument, getDocument, updateDocument, deleteDocument, requestAccess, approveRequest, addUserAccess, getDocHistory, restoreVersion, compareVersions, exportToPDF } from '../controllers/docController.js';
const router = express.Router();

router.post('/create', authMiddleware, createDocument);
router.get('/read', authMiddleware, getDocument);
router.patch('/update/:id', authMiddleware, updateDocument);
router.delete('/delete/:id', authMiddleware, deleteDocument);
router.post('/request-access/:id', authMiddleware, requestAccess);
router.patch('/approve-request/:id', authMiddleware, approveRequest);
router.patch('/add-user-access/:id', authMiddleware, addUserAccess);
router.get('/:id/history', authMiddleware, getDocHistory);
router.patch('/:id/restore/:versionID', authMiddleware, restoreVersion);
router.get('/:id/compare/:v1/:v2', authMiddleware, compareVersions);
router.get('/:id/export/pdf', authMiddleware, exportToPDF);
export default router;