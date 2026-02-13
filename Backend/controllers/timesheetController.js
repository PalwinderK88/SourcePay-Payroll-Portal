const Timesheet = require('../models/Timesheet');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for timesheet uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/timesheets');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const { contractor_id, period_type, week_number, month, year } = req.body;
    const period = period_type === 'weekly' ? `Week${week_number}` : month;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${contractor_id}_${period}_${year}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, XLS, and XLSX files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload timesheet
exports.uploadTimesheet = async (req, res) => {
  try {
    const {
      contractor_id,
      contractor_name,
      period_type,
      week_number,
      month,
      year
    } = req.body;

    // Validate required fields
    if (!contractor_id || !contractor_name || !period_type || !year) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (period_type === 'weekly' && !week_number) {
      return res.status(400).json({ message: 'Week number is required for weekly timesheets' });
    }

    if (period_type === 'monthly' && !month) {
      return res.status(400).json({ message: 'Month is required for monthly timesheets' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get agency info from logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is agency_admin
    if (user.role !== 'agency_admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only agency admins can upload timesheets' });
    }

    // Check for duplicate timesheet
    const existing = await Timesheet.findByPeriod(
      user.agency_id,
      contractor_id,
      period_type,
      week_number,
      month,
      year
    );

    if (existing) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'Timesheet already exists for this contractor and period' 
      });
    }

    // Create timesheet record
    const timesheet = await Timesheet.create({
      agency_id: user.agency_id,
      agency_name: user.agency_name,
      contractor_id,
      contractor_name,
      period_type,
      week_number: period_type === 'weekly' ? week_number : null,
      month: period_type === 'monthly' ? month : null,
      year,
      file_path: req.file.path,
      uploaded_by: req.user.id
    });

    res.status(201).json({
      message: 'Timesheet uploaded successfully',
      timesheet
    });
  } catch (error) {
    console.error('Error uploading timesheet:', error);
    res.status(500).json({ message: 'Error uploading timesheet', error: error.message });
  }
};

// Get all timesheets (admin only)
exports.getAllTimesheets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const timesheets = await Timesheet.findAll();
    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ message: 'Error fetching timesheets' });
  }
};

// Get timesheets for agency admin's agency
exports.getAgencyTimesheets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'agency_admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let timesheets;
    if (user.role === 'admin') {
      timesheets = await Timesheet.findAll();
    } else {
      timesheets = await Timesheet.findByAgencyName(user.agency_name);
    }

    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching agency timesheets:', error);
    res.status(500).json({ message: 'Error fetching timesheets' });
  }
};

// Get contractors for agency admin's agency
exports.getAgencyContractors = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'agency_admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allUsers = await User.getAll();
    
    let contractors;
    if (user.role === 'admin') {
      contractors = allUsers.filter(u => u.role === 'contractor');
    } else {
      contractors = allUsers.filter(u => 
        u.role === 'contractor' && u.agency_name === user.agency_name
      );
    }

    res.json(contractors);
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ message: 'Error fetching contractors' });
  }
};

// Download timesheet
exports.downloadTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const timesheet = await Timesheet.findById(id);

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    const user = await User.findById(req.user.id);
    
    // Check permissions
    if (user.role !== 'admin' && user.agency_name !== timesheet.agency_name) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!fs.existsSync(timesheet.file_path)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(timesheet.file_path);
  } catch (error) {
    console.error('Error downloading timesheet:', error);
    res.status(500).json({ message: 'Error downloading timesheet' });
  }
};

// Delete timesheet
exports.deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const timesheet = await Timesheet.findById(id);

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    const user = await User.findById(req.user.id);
    
    // Only admin or the agency admin who uploaded can delete
    if (user.role !== 'admin' && user.agency_name !== timesheet.agency_name) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete file
    if (fs.existsSync(timesheet.file_path)) {
      fs.unlinkSync(timesheet.file_path);
    }

    // Delete record
    await Timesheet.delete(id);

    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting timesheet:', error);
    res.status(500).json({ message: 'Error deleting timesheet' });
  }
};

// Export upload middleware
exports.uploadMiddleware = upload.single('timesheet');

// Bulk upload middleware - accepts CSV + multiple PDFs
const bulkUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/timesheets');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `${timestamp}_${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'csv') {
      const allowedTypes = /csv|xlsx|xls/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV and Excel files are allowed for data file'));
      }
    } else if (file.fieldname === 'pdfs') {
      const allowedTypes = /pdf/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for timesheets'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

exports.bulkUploadMiddleware = bulkUpload.fields([
  { name: 'csv', maxCount: 1 },
  { name: 'pdfs', maxCount: 100 }
]);

// Parse CSV/Excel file
const parseDataFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.csv') {
    // Parse CSV
    return new Promise((resolve, reject) => {
      const results = [];
      const csvParser = require('csv-parser');
      
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  } else if (ext === '.xlsx' || ext === '.xls') {
    // Parse Excel
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } else {
    throw new Error('Unsupported file format');
  }
};

// Bulk upload timesheets
exports.bulkUploadTimesheets = async (req, res) => {
  let csvFilePath = null;
  const uploadedPDFs = [];
  
  try {
    // Check if CSV file was uploaded
    if (!req.files || !req.files.csv) {
      return res.status(400).json({ 
        message: 'CSV/Excel file is required' 
      });
    }

    // Get user info
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is agency_admin
    if (user.role !== 'agency_admin' && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Only agency admins can upload timesheets' 
      });
    }

    // Get CSV file
    const csvFile = req.files.csv[0];
    csvFilePath = csvFile.path;
    
    // Get PDF files (optional)
    const pdfFiles = req.files.pdfs || [];
    pdfFiles.forEach(pdf => uploadedPDFs.push(pdf.path));

    // Parse CSV/Excel
    const timesheetData = await parseDataFile(csvFilePath);

    if (!timesheetData || timesheetData.length === 0) {
      throw new Error('No data found in CSV/Excel file');
    }

    // Validate CSV data
    const errors = [];
    const validData = [];

    for (let i = 0; i < timesheetData.length; i++) {
      const row = timesheetData[i];
      const rowNum = i + 2; // +2 because row 1 is header, and arrays start at 0

      // Validate required fields
      if (!row.contractor_id) {
        errors.push(`Row ${rowNum}: contractor_id is required`);
        continue;
      }
      if (!row.contractor_name) {
        errors.push(`Row ${rowNum}: contractor_name is required`);
        continue;
      }
      if (!row.period_type) {
        errors.push(`Row ${rowNum}: period_type is required`);
        continue;
      }
      if (!row.year) {
        errors.push(`Row ${rowNum}: year is required`);
        continue;
      }

      // Validate period_type
      if (row.period_type !== 'weekly' && row.period_type !== 'monthly') {
        errors.push(`Row ${rowNum}: period_type must be 'weekly' or 'monthly'`);
        continue;
      }

      // Validate period-specific fields
      if (row.period_type === 'weekly' && !row.week_number) {
        errors.push(`Row ${rowNum}: week_number is required for weekly timesheets`);
        continue;
      }
      if (row.period_type === 'monthly' && !row.month) {
        errors.push(`Row ${rowNum}: month is required for monthly timesheets`);
        continue;
      }

      // Find matching PDF file (optional)
      let pdfFile = null;
      if (pdfFiles.length > 0 && row.filename) {
        pdfFile = pdfFiles.find(pdf => 
          pdf.originalname.toLowerCase() === row.filename.toLowerCase()
        );
        
        // Only error if filename is provided but file not found
        if (row.filename && !pdfFile) {
          console.log(`Warning: PDF file '${row.filename}' not found for row ${rowNum}, proceeding without PDF`);
        }
      }

      // Check for duplicate timesheet
      const existing = await Timesheet.findByPeriod(
        user.agency_id,
        row.contractor_id,
        row.period_type,
        row.week_number || null,
        row.month || null,
        row.year
      );

      if (existing) {
        errors.push(`Row ${rowNum}: Timesheet already exists for ${row.contractor_name} - ${row.period_type} ${row.week_number || row.month} ${row.year}`);
        continue;
      }

      validData.push({
        ...row,
        pdfFile: pdfFile || null
      });
    }

    // If there are validation errors, return them
    if (errors.length > 0 && validData.length === 0) {
      // Clean up uploaded files
      if (csvFilePath && fs.existsSync(csvFilePath)) {
        fs.unlinkSync(csvFilePath);
      }
      uploadedPDFs.forEach(pdf => {
        if (fs.existsSync(pdf)) fs.unlinkSync(pdf);
      });

      return res.status(400).json({
        message: 'Validation failed for all rows',
        errors: errors,
        successCount: 0,
        failureCount: errors.length
      });
    }

    // Process valid timesheets
    const results = {
      successful: [],
      failed: []
    };

    for (const data of validData) {
      try {
        // Create timesheet record
        const timesheet = await Timesheet.create({
          agency_id: user.agency_id,
          agency_name: user.agency_name,
          contractor_id: data.contractor_id,
          contractor_name: data.contractor_name,
          period_type: data.period_type,
          week_number: data.period_type === 'weekly' ? data.week_number : null,
          month: data.period_type === 'monthly' ? data.month : null,
          year: data.year,
          file_path: data.pdfFile ? data.pdfFile.path : null,
          uploaded_by: req.user.id
        });

        results.successful.push({
          contractor_name: data.contractor_name,
          period: data.period_type === 'weekly' ? `Week ${data.week_number}` : data.month,
          year: data.year,
          filename: data.filename
        });
      } catch (error) {
        results.failed.push({
          contractor_name: data.contractor_name,
          period: data.period_type === 'weekly' ? `Week ${data.week_number}` : data.month,
          year: data.year,
          filename: data.filename,
          error: error.message
        });
        
        // Delete the PDF file if timesheet creation failed
        if (data.pdfFile && fs.existsSync(data.pdfFile.path)) {
          fs.unlinkSync(data.pdfFile.path);
        }
      }
    }

    // Clean up CSV file
    if (csvFilePath && fs.existsSync(csvFilePath)) {
      fs.unlinkSync(csvFilePath);
    }

    // Clean up unused PDF files
    uploadedPDFs.forEach(pdfPath => {
      const isUsed = validData.some(data => data.pdfFile.path === pdfPath);
      if (!isUsed && fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    });

    // Return results
    res.status(results.successful.length > 0 ? 201 : 400).json({
      message: `Bulk upload completed: ${results.successful.length} successful, ${results.failed.length + errors.length} failed`,
      successCount: results.successful.length,
      failureCount: results.failed.length + errors.length,
      successful: results.successful,
      failed: results.failed,
      validationErrors: errors
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    
    // Clean up files on error
    if (csvFilePath && fs.existsSync(csvFilePath)) {
      fs.unlinkSync(csvFilePath);
    }
    uploadedPDFs.forEach(pdf => {
      if (fs.existsSync(pdf)) fs.unlinkSync(pdf);
    });

    res.status(500).json({ 
      message: 'Error processing bulk upload', 
      error: error.message 
    });
  }
};

// Download bulk upload template
exports.downloadBulkTemplate = async (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../templates/timesheet_bulk_upload_template.csv');
    
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ message: 'Template file not found' });
    }

    res.download(templatePath, 'timesheet_bulk_upload_template.csv');
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({ message: 'Error downloading template' });
  }
};
