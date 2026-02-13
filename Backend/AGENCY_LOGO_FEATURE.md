# Agency Logo Upload Feature - White Labelling

## Overview
This feature allows agency admins to upload their company logo for white labelling purposes. Each agency can customize the portal with their own branding.

## Features Implemented

### 1. Database Schema
- Added `logo_path` column to the `agencies` table
- Stores the relative path to the uploaded logo file

### 2. File Storage
- Logos are stored in `uploads/logos/` directory
- Naming convention: `agency_{agencyId}_{timestamp}.{extension}`
- Supported formats: JPG, JPEG, PNG, SVG, WEBP
- Maximum file size: 5MB

### 3. API Endpoints

#### Upload/Update Agency Logo
```
POST /api/agencies/:id/logo
```
- **Authorization**: Agency admin (own agency only) or System admin (any agency)
- **Content-Type**: multipart/form-data
- **Body**: Form data with `logo` field containing the image file
- **Response**: Updated agency object with logo_path

**Example using cURL:**
```bash
curl -X POST http://localhost:5003/api/agencies/1/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "logo=@/path/to/logo.png"
```

**Example using JavaScript (Fetch API):**
```javascript
const formData = new FormData();
formData.append('logo', logoFile);

const response = await fetch(`http://localhost:5003/api/agencies/${agencyId}/logo`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.agency.logo_path); // /uploads/logos/agency_1_1234567890.png
```

#### Get Agency Details (including logo)
```
GET /api/agencies/:id
```
- **Authorization**: Public (no authentication required)
- **Response**: Agency object including logo_path

**Example:**
```javascript
const response = await fetch('http://localhost:5003/api/agencies/1');
const agency = await response.json();
console.log(agency.logo_path); // /uploads/logos/agency_1_1234567890.png
```

#### Delete Agency Logo
```
DELETE /api/agencies/:id/logo
```
- **Authorization**: Agency admin (own agency only) or System admin (any agency)
- **Response**: Updated agency object with logo_path set to null

**Example:**
```javascript
const response = await fetch(`http://localhost:5003/api/agencies/${agencyId}/logo`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 4. Authorization Rules

- **Agency Admin**: Can upload/update/delete logo ONLY for their own agency (where `user.agency_id` matches the agency ID)
- **System Admin**: Can upload/update/delete logo for ANY agency

### 5. Validation

#### File Type Validation
Only image files are accepted:
- image/jpeg
- image/jpg
- image/png
- image/svg+xml
- image/webp

#### File Size Validation
- Maximum file size: 5MB (5,242,880 bytes)

#### Authorization Validation
- Agency admins can only manage logos for their own agency
- System admins can manage logos for any agency

### 6. File Management

#### Automatic Old Logo Deletion
When a new logo is uploaded, the old logo file is automatically deleted from the filesystem to prevent storage bloat.

#### Logo Access
Logos are served statically via the `/uploads` route:
```
http://localhost:5003/uploads/logos/agency_1_1234567890.png
```

## Frontend Integration Guide

### 1. Display Agency Logo
```javascript
// In your agency dashboard component
const AgencyDashboard = () => {
  const [agency, setAgency] = useState(null);
  
  useEffect(() => {
    // Fetch agency details
    fetch(`http://localhost:5003/api/agencies/${agencyId}`)
      .then(res => res.json())
      .then(data => setAgency(data));
  }, [agencyId]);
  
  return (
    <div>
      {agency?.logo_path ? (
        <img 
          src={`http://localhost:5003${agency.logo_path}`} 
          alt={`${agency.name} logo`}
          style={{ maxWidth: '200px', maxHeight: '100px' }}
        />
      ) : (
        <div>No logo uploaded</div>
      )}
    </div>
  );
};
```

### 2. Upload Logo Form
```javascript
const LogoUpload = ({ agencyId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, SVG, and WEBP are allowed.');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }
    
    setError(null);
    setSelectedFile(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('logo', selectedFile);
    
    try {
      const response = await fetch(`http://localhost:5003/api/agencies/${agencyId}/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      
      const result = await response.json();
      onUploadSuccess(result.agency);
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Logo'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};
```

### 3. Delete Logo
```javascript
const handleDeleteLogo = async () => {
  if (!confirm('Are you sure you want to delete the logo?')) return;
  
  try {
    const response = await fetch(`http://localhost:5003/api/agencies/${agencyId}/logo`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    
    const result = await response.json();
    // Update UI with result.agency
  } catch (err) {
    console.error('Error deleting logo:', err);
  }
};
```

## Testing

### Manual Testing Steps

1. **Test Logo Upload (Agency Admin)**
   - Login as an agency admin
   - Navigate to agency settings/dashboard
   - Upload a logo (JPG, PNG, SVG, or WEBP)
   - Verify the logo appears in the UI
   - Check that the file exists in `uploads/logos/`

2. **Test Logo Update**
   - Upload a new logo
   - Verify the old logo file is deleted
   - Verify the new logo appears

3. **Test Logo Delete**
   - Delete the logo
   - Verify the logo file is removed from filesystem
   - Verify the UI shows no logo

4. **Test Authorization**
   - Try to upload logo for a different agency as agency_admin
   - Should receive 403 Forbidden error
   - Login as system admin and upload logo for any agency
   - Should succeed

5. **Test Validation**
   - Try uploading a non-image file (e.g., PDF)
   - Should receive error about invalid file type
   - Try uploading a file larger than 5MB
   - Should receive error about file size

## Files Modified/Created

### New Files
- `migrations/addAgencyLogoColumn.js` - Database migration script
- `AGENCY_LOGO_FEATURE.md` - This documentation file
- `TODO.md` - Implementation checklist

### Modified Files
- `models/Agency.js` - Added logo-related methods
- `controllers/agencyController.js` - Added uploadLogo, deleteLogo, getAgencyById methods
- `routes/agencies.js` - Added logo upload/delete routes

## Database Schema

```sql
-- agencies table structure after migration
CREATE TABLE agencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  logo_path TEXT
);
```

## Security Considerations

1. **File Type Validation**: Only image files are accepted
2. **File Size Limit**: Maximum 5MB to prevent storage abuse
3. **Authorization**: Agency admins can only manage their own agency's logo
4. **Path Traversal Prevention**: File paths are sanitized and controlled
5. **Old File Cleanup**: Previous logos are automatically deleted to prevent storage bloat

## Future Enhancements

Potential improvements for future versions:
- Image optimization/compression on upload
- Multiple logo sizes (thumbnail, medium, large)
- Logo preview before upload
- Drag-and-drop upload interface
- Logo usage analytics
- Custom logo dimensions validation
- Support for animated logos (GIF)
- Logo approval workflow for multi-level admin systems
