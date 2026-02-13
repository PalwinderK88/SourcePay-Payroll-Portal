const Document = require('../models/document');
const fs = require('fs');
const path = require('path');

// Upload a document (contractors can upload their own, admins can upload for anyone)
exports.uploadDocument = async (req, res) => {
  try {
    const { doc_type, expiry_date, is_required } = req.body;
    let { user_id } = req.body;
    const file = req.file;

    // Validation
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!doc_type) {
      return res.status(400).json({ message: 'Document type is required' });
    }

    // If contractor, they can only upload for themselves
    if (req.user.role === 'contractor') {
      user_id = req.user.id;
    }

    // If admin and no user_id provided, upload for themselves
    if (!user_id) {
      user_id = req.user.id;
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${user_id}_${doc_type}_${timestamp}_${file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Save to database with relative path
    const relativePath = `/uploads/documents/${fileName}`;
    const document = await Document.create(
      user_id, 
      doc_type, 
      file.originalname, 
      relativePath,
      expiry_date || null,
      is_required ? 1 : 0
    );

    console.log('✅ Document uploaded successfully:', {
      id: document.id,
      user_id,
      doc_type,
      file_name: file.originalname,
      file_path: relativePath,
      expiry_date: expiry_date || 'none'
    });

    res.json(document);
  } catch (err) {
    console.error('❌ Error uploading document:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get documents for logged-in user
exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.getByUser(req.user.id);
    res.json(documents);
  } catch (err) {
    console.error('❌ Error fetching documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all documents (admin only)
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.getAll();
    res.json(documents);
  } catch (err) {
    console.error('❌ Error fetching all documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get expiring documents (admin only)
exports.getExpiringDocuments = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const documents = await Document.getExpiringSoon(days);
    res.json(documents);
  } catch (err) {
    console.error('❌ Error fetching expiring documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get expired documents (admin only)
exports.getExpiredDocuments = async (req, res) => {
  try {
    const documents = await Document.getExpired();
    res.json(documents);
  } catch (err) {
    console.error('❌ Error fetching expired documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get missing required documents for a user
exports.getMissingDocuments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Only allow users to check their own missing docs, or admins to check anyone's
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const missingDocs = await Document.getMissingRequiredDocuments(userId);
    res.json(missingDocs);
  } catch (err) {
    console.error('❌ Error fetching missing documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Set required documents for a user (admin only)
exports.setRequiredDocuments = async (req, res) => {
  try {
    const { user_id, doc_types } = req.body;
    
    if (!user_id || !doc_types || !Array.isArray(doc_types)) {
      return res.status(400).json({ message: 'user_id and doc_types array are required' });
    }
    
    await Document.setRequiredDocuments(user_id, doc_types);
    res.json({ message: 'Required documents set successfully', user_id, doc_types });
  } catch (err) {
    console.error('❌ Error setting required documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update document status (admin only)
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'expired', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (active, expired, rejected)' });
    }
    
    await Document.updateStatus(id, status);
    res.json({ message: 'Document status updated successfully', id, status });
  } catch (err) {
    console.error('❌ Error updating document status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
