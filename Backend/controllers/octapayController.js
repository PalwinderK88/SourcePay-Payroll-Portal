const Payslip = require('../models/payslip');
const User = require('../models/user');
const path = require('path');
const fs = require('fs');

/**
 * Upload a single payslip from OctaPay
 */
exports.uploadPayslip = async (req, res) => {
  try {
    const { 
      employee_email, 
      period_type, 
      month, 
      week_number, 
      year, 
      amount,
      holiday_pay,
      sick_pay,
      expenses
    } = req.body;
    
    const file = req.file;
    
    // Validation
    if (!file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    if (!employee_email || !year || !period_type) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: employee_email, year, period_type' 
      });
    }

    // Validate period-specific fields
    if (period_type === 'monthly' && !month) {
      return res.status(400).json({ 
        success: false,
        message: 'Month is required for monthly payslips' 
      });
    }

    if (period_type === 'weekly' && !week_number) {
      return res.status(400).json({ 
        success: false,
        message: 'Week number is required for weekly payslips' 
      });
    }

    // Find user by email
    const user = await User.findByEmail(employee_email);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: `Employee not found with email: ${employee_email}` 
      });
    }

    // Only allow payslip upload for contractors
    if (user.role !== 'contractor') {
      return res.status(400).json({ 
        success: false,
        message: 'Payslips can only be uploaded for contractors' 
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'payslips');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename based on period type
    const timestamp = Date.now();
    let fileName;
    if (period_type === 'weekly') {
      fileName = `${user.id}_Week${week_number}_${year}_${timestamp}_${file.originalname}`;
    } else {
      fileName = `${user.id}_${month}_${year}_${timestamp}_${file.originalname}`;
    }
    
    const filePath = path.join(uploadsDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Store relative path in database
    const relativeFilePath = `/uploads/payslips/${fileName}`;

    // Create payslip record with period information and optional fields
    const periodValue = period_type === 'weekly' ? `Week ${week_number}` : month;
    const payslip = await Payslip.create(
      user.id, 
      periodValue, 
      year, 
      amount || null, 
      file.originalname, 
      relativeFilePath,
      holiday_pay || null,
      sick_pay || null,
      expenses || null
    );

    console.log('✅ [OctaPay] Payslip uploaded successfully:', {
      payslip_id: payslip.id,
      employee: user.name,
      email: employee_email,
      period: periodValue,
      year: year
    });

    res.json({ 
      success: true,
      message: 'Payslip uploaded successfully',
      data: {
        payslip_id: payslip.id,
        employee_name: user.name,
        employee_email: user.email,
        period: periodValue,
        year: year,
        amount: amount,
        holiday_pay: holiday_pay,
        sick_pay: sick_pay,
        expenses: expenses,
        uploaded_at: payslip.uploaded_at
      }
    });
  } catch (err) {
    console.error('❌ [OctaPay] Error uploading payslip:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
};

/**
 * Bulk upload multiple payslips from OctaPay
 */
exports.bulkUploadPayslips = async (req, res) => {
  try {
    const { payslips } = req.body;
    
    if (!payslips || !Array.isArray(payslips) || payslips.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid request: payslips array is required' 
      });
    }

    const results = {
      success: [],
      failed: []
    };

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'payslips');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Process each payslip
    for (const payslipData of payslips) {
      try {
        const { 
          employee_email, 
          period_type, 
          month, 
          week_number, 
          year, 
          amount,
          holiday_pay,
          sick_pay,
          expenses,
          file_base64,
          file_name
        } = payslipData;

        // Validation
        if (!employee_email || !year || !period_type || !file_base64) {
          results.failed.push({
            employee_email,
            error: 'Missing required fields'
          });
          continue;
        }

        // Find user by email
        const user = await User.findByEmail(employee_email);
        if (!user) {
          results.failed.push({
            employee_email,
            error: 'Employee not found'
          });
          continue;
        }

        // Only allow payslip upload for contractors
        if (user.role !== 'contractor') {
          results.failed.push({
            employee_email,
            error: 'Not a contractor'
          });
          continue;
        }

        // Decode base64 file
        const fileBuffer = Buffer.from(file_base64, 'base64');

        // Generate unique filename
        const timestamp = Date.now();
        const originalFileName = file_name || 'payslip.pdf';
        let fileName;
        if (period_type === 'weekly') {
          fileName = `${user.id}_Week${week_number}_${year}_${timestamp}_${originalFileName}`;
        } else {
          fileName = `${user.id}_${month}_${year}_${timestamp}_${originalFileName}`;
        }
        
        const filePath = path.join(uploadsDir, fileName);

        // Save file to disk
        fs.writeFileSync(filePath, fileBuffer);

        // Store relative path in database
        const relativeFilePath = `/uploads/payslips/${fileName}`;

        // Create payslip record
        const periodValue = period_type === 'weekly' ? `Week ${week_number}` : month;
        const payslip = await Payslip.create(
          user.id, 
          periodValue, 
          year, 
          amount || null, 
          originalFileName, 
          relativeFilePath,
          holiday_pay || null,
          sick_pay || null,
          expenses || null
        );

        results.success.push({
          payslip_id: payslip.id,
          employee_email,
          employee_name: user.name,
          period: periodValue,
          year: year
        });

      } catch (err) {
        results.failed.push({
          employee_email: payslipData.employee_email,
          error: err.message
        });
      }
    }

    console.log('✅ [OctaPay] Bulk upload completed:', {
      total: payslips.length,
      success: results.success.length,
      failed: results.failed.length
    });

    res.json({ 
      success: true,
      message: 'Bulk upload completed',
      data: {
        total: payslips.length,
        successful: results.success.length,
        failed: results.failed.length,
        results: results
      }
    });
  } catch (err) {
    console.error('❌ [OctaPay] Error in bulk upload:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
};

/**
 * Handle webhook notifications from OctaPay
 */
exports.handleWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('📨 [OctaPay] Webhook received:', {
      event,
      timestamp: new Date().toISOString()
    });

    // Handle different webhook events
    switch (event) {
      case 'payslip.created':
        // Handle payslip created event
        console.log('📄 Payslip created for:', data.employee_email);
        break;
        
      case 'payslip.updated':
        // Handle payslip updated event
        console.log('📝 Payslip updated for:', data.employee_email);
        break;
        
      case 'payslip.deleted':
        // Handle payslip deleted event
        console.log('🗑️ Payslip deleted for:', data.employee_email);
        break;
        
      default:
        console.log('⚠️ Unknown webhook event:', event);
    }

    // Acknowledge receipt
    res.json({ 
      success: true,
      message: 'Webhook received',
      event: event
    });
  } catch (err) {
    console.error('❌ [OctaPay] Webhook error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Webhook processing error', 
      error: err.message 
    });
  }
};
