const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const octapayController = require('../controllers/octapayController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.OCTAPAY_API_KEY || 'your-secure-api-key-here';
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized: Invalid API key' 
    });
  }
  
  next();
};

// Middleware to verify webhook signature (optional but recommended)
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-octapay-signature'];
  const webhookSecret = process.env.OCTAPAY_WEBHOOK_SECRET || 'your-webhook-secret';
  
  if (signature) {
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized: Invalid signature' 
      });
    }
  }
  
  next();
};

/**
 * @route   POST /api/octapay/upload-payslip
 * @desc    Upload payslip from OctaPay system
 * @access  API Key Required
 * @body    {
 *            employee_email: string (required),
 *            period_type: 'monthly' | 'weekly' (required),
 *            month: string (required if monthly),
 *            week_number: number (required if weekly),
 *            year: number (required),
 *            amount: number (optional),
 *            holiday_pay: number (optional),
 *            sick_pay: number (optional),
 *            expenses: number (optional),
 *            file: PDF file (required)
 *          }
 */
router.post('/upload-payslip', verifyApiKey, upload.single('file'), octapayController.uploadPayslip);

/**
 * @route   POST /api/octapay/bulk-upload
 * @desc    Bulk upload multiple payslips from OctaPay
 * @access  API Key Required
 * @body    {
 *            payslips: [
 *              {
 *                employee_email: string,
 *                period_type: string,
 *                month: string,
 *                year: number,
 *                amount: number,
 *                holiday_pay: number,
 *                sick_pay: number,
 *                expenses: number,
 *                file_base64: string (base64 encoded PDF)
 *              }
 *            ]
 *          }
 */
router.post('/bulk-upload', verifyApiKey, octapayController.bulkUploadPayslips);

/**
 * @route   GET /api/octapay/health
 * @desc    Health check endpoint for OctaPay integration
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'OctaPay integration is active',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/octapay/webhook
 * @desc    Webhook endpoint for OctaPay notifications
 * @access  Webhook Secret Required
 */
router.post('/webhook', verifyWebhookSignature, octapayController.handleWebhook);

module.exports = router;
