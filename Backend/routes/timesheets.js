const express = require('express');
const router = express.Router();
const timesheetController = require('../controllers/timesheetController');
const { authenticateToken } = require('../middleware/auth');

// Upload timesheet (agency_admin and admin only)
router.post(
  '/upload',
  authenticateToken,
  timesheetController.uploadMiddleware,
  timesheetController.uploadTimesheet
);

// Get all timesheets (admin only)
router.get('/all', authenticateToken, timesheetController.getAllTimesheets);

// Get timesheets for agency admin's agency
router.get('/agency', authenticateToken, timesheetController.getAgencyTimesheets);

// Get contractors for agency admin's agency
router.get('/contractors', authenticateToken, timesheetController.getAgencyContractors);

// Download timesheet
router.get('/download/:id', authenticateToken, timesheetController.downloadTimesheet);

// Delete timesheet
router.delete('/:id', authenticateToken, timesheetController.deleteTimesheet);

// Bulk upload timesheets (agency_admin and admin only)
router.post(
  '/bulk-upload',
  authenticateToken,
  timesheetController.bulkUploadMiddleware,
  timesheetController.bulkUploadTimesheets
);

// Download bulk upload template
router.get('/bulk-template', authenticateToken, timesheetController.downloadBulkTemplate);

module.exports = router;
