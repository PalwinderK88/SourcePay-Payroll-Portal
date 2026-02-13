const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const agencyController = require('../controllers/agencyController');
const multer = require('multer');

// Configure multer for file upload (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Get all agencies (public - needed for signup)
router.get('/', agencyController.getAllAgencies);

// Get agency by ID (public - needed to display agency info)
router.get('/:id', agencyController.getAgencyById);

// Create agency (admin only)
router.post('/', auth(['admin']), agencyController.createAgency);

// Update agency (admin only)
router.put('/:id', auth(['admin']), agencyController.updateAgency);

// Delete agency (admin only)
router.delete('/:id', auth(['admin']), agencyController.deleteAgency);

// Upload agency logo (agency_admin for own agency, admin for any)
router.post('/:id/logo', auth(['admin', 'agency_admin']), upload.single('logo'), agencyController.uploadLogo);

// Delete agency logo (agency_admin for own agency, admin for any)
router.delete('/:id/logo', auth(['admin', 'agency_admin']), agencyController.deleteLogo);

module.exports = router;
