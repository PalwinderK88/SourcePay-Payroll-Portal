const Agency = require('../models/Agency');
const fs = require('fs');
const path = require('path');

// Get all agencies
exports.getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll();
    res.json(agencies);
  } catch (err) {
    console.error('Error fetching agencies:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get agency by ID
exports.getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const agency = await Agency.findById(id);
    
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    res.json(agency);
  } catch (err) {
    console.error('Error fetching agency:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new agency (admin only)
exports.createAgency = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Agency name is required' });
    }

    const agency = await Agency.create(name);
    res.json({ message: 'Agency created successfully', agency });
  } catch (err) {
    console.error('Error creating agency:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update agency (admin only)
exports.updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Agency name is required' });
    }

    const agency = await Agency.update(id, name);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    res.json({ message: 'Agency updated successfully', agency });
  } catch (err) {
    console.error('Error updating agency:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete agency (admin only)
exports.deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;
    await Agency.delete(id);
    res.json({ message: 'Agency deleted successfully' });
  } catch (err) {
    console.error('Error deleting agency:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload agency logo (agency_admin for own agency, admin for any)
exports.uploadLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    // Validation
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if agency exists
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    // Authorization check: agency_admin can only upload for their own agency
    if (req.user.role === 'agency_admin' && req.user.agency_id !== parseInt(id)) {
      return res.status(403).json({ message: 'You can only upload logo for your own agency' });
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        message: 'Invalid file type. Only JPG, JPEG, PNG, SVG, and WEBP are allowed' 
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return res.status(400).json({ 
        message: 'File size too large. Maximum size is 5MB' 
      });
    }

    // Create logos directory if it doesn't exist
    const logosDir = path.join(__dirname, '../uploads/logos');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    // Delete old logo if exists
    if (agency.logo_path) {
      const oldLogoPath = path.join(__dirname, '..', agency.logo_path);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
        console.log('🗑️ Deleted old logo:', oldLogoPath);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `agency_${id}_${timestamp}${fileExtension}`;
    const filePath = path.join(logosDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Update database with relative path
    const relativePath = `/uploads/logos/${fileName}`;
    const updatedAgency = await Agency.updateLogo(id, relativePath);

    console.log('✅ Agency logo uploaded successfully:', {
      agency_id: id,
      agency_name: agency.name,
      file_name: file.originalname,
      file_path: relativePath
    });

    res.json({ 
      message: 'Logo uploaded successfully', 
      agency: updatedAgency 
    });
  } catch (err) {
    console.error('❌ Error uploading agency logo:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete agency logo (agency_admin for own agency, admin for any)
exports.deleteLogo = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if agency exists
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    // Authorization check: agency_admin can only delete logo for their own agency
    if (req.user.role === 'agency_admin' && req.user.agency_id !== parseInt(id)) {
      return res.status(403).json({ message: 'You can only delete logo for your own agency' });
    }

    // Check if logo exists
    if (!agency.logo_path) {
      return res.status(404).json({ message: 'No logo found for this agency' });
    }

    // Delete logo file from filesystem
    const logoPath = path.join(__dirname, '..', agency.logo_path);
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
      console.log('🗑️ Deleted logo file:', logoPath);
    }

    // Update database to remove logo path
    const updatedAgency = await Agency.removeLogo(id);

    console.log('✅ Agency logo deleted successfully:', {
      agency_id: id,
      agency_name: agency.name
    });

    res.json({ 
      message: 'Logo deleted successfully', 
      agency: updatedAgency 
    });
  } catch (err) {
    console.error('❌ Error deleting agency logo:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
