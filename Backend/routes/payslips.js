const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const payslipController = require('../controllers/payslipController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Get payslips for logged-in user
router.get('/', auth(), payslipController.getMyPayslips);

// Get all payslips (admin only)
router.get('/all', auth(['admin']), payslipController.getAllPayslips);

// Upload payslip (admin only)
router.post('/upload', auth(['admin']), upload.single('file'), payslipController.uploadPayslip);

module.exports = router;
