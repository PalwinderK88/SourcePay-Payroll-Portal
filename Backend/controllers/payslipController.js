const Payslip = require('../models/payslip');
const path = require('path');
const fs = require('fs');

// Upload a payslip (admin only)
exports.uploadPayslip = async (req, res) => {
  try {
    const { 
      user_id, period_type, month, week_number, year, amount, 
      holiday_pay, sick_pay, expenses,
      gross_pay, tax_amount, national_insurance, cis_deduction,
      pension_contribution, admin_fee, net_pay, breakdown_notes
    } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!user_id || !year) {
      return res.status(400).json({ message: 'Missing required fields: user_id, year' });
    }

    // Validate period-specific fields
    if (period_type === 'monthly' && !month) {
      return res.status(400).json({ message: 'Month is required for monthly payslips' });
    }

    if (period_type === 'weekly' && !week_number) {
      return res.status(400).json({ message: 'Week number is required for weekly payslips' });
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
      fileName = `${user_id}_Week${week_number}_${year}_${timestamp}_${file.originalname}`;
    } else {
      fileName = `${user_id}_${month}_${year}_${timestamp}_${file.originalname}`;
    }
    
    const filePath = path.join(uploadsDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Store relative path in database
    const relativeFilePath = `/uploads/payslips/${fileName}`;

    // Prepare breakdown data
    const breakdown = {
      gross_pay: gross_pay || null,
      tax_amount: tax_amount || null,
      national_insurance: national_insurance || null,
      cis_deduction: cis_deduction || null,
      pension_contribution: pension_contribution || null,
      admin_fee: admin_fee || null,
      net_pay: net_pay || null,
      breakdown_notes: breakdown_notes || null
    };

    // Create payslip record with period information and optional fields
    const periodValue = period_type === 'weekly' ? `Week ${week_number}` : month;
    const payslip = await Payslip.create(
      user_id, 
      periodValue, 
      year, 
      amount || null, 
      file.originalname, 
      relativeFilePath,
      holiday_pay || null,
      sick_pay || null,
      expenses || null,
      breakdown
    );

    console.log('✅ Payslip uploaded successfully:', payslip);
    
    // Send notification to user
    const notificationService = req.app.get('notificationService');
    if (notificationService) {
      await notificationService.notifyPayslipUploaded(user_id, periodValue, year);
    }
    
    res.json(payslip);
  } catch (err) {
    console.error('❌ Error uploading payslip:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get payslips for the logged-in user
exports.getMyPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.getByUser(req.user.id);
    res.json(payslips);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Get all payslips (admin)
exports.getAllPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.getAll();
    res.json(payslips);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};