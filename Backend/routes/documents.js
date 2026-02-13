const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const documentController = require('../controllers/documentController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Get documents for logged-in user
router.get('/', auth(), documentController.getMyDocuments);

// Get all documents (admin only)
router.get('/all', auth(['admin']), documentController.getAllDocuments);

// Get expiring documents (admin only)
router.get('/expiring', auth(['admin']), documentController.getExpiringDocuments);

// Get expired documents (admin only)
router.get('/expired', auth(['admin']), documentController.getExpiredDocuments);

// Get missing required documents for a user
router.get('/missing/:userId?', auth(), documentController.getMissingDocuments);

// Set required documents for a user (admin only)
router.post('/set-requirements', auth(['admin']), documentController.setRequiredDocuments);

// Update document status (admin only)
router.put('/:id/status', auth(['admin']), documentController.updateDocumentStatus);

// Upload document (contractors can upload their own, admins can upload for anyone)
router.post('/upload', auth(['admin', 'contractor']), upload.single('file'), documentController.uploadDocument);

module.exports = router;
