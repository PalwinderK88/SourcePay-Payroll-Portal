# Quick Start Guide - Agency Logo Upload

## For Agency Admins

### Step 1: Login to Your Dashboard
Login with your agency admin credentials to access your dashboard.

### Step 2: Upload Your Logo

**Using Postman or API Client:**

```bash
# Replace {YOUR_AGENCY_ID} with your actual agency ID
# Replace {YOUR_JWT_TOKEN} with your authentication token
# Replace /path/to/logo.png with your logo file path

curl -X POST http://localhost:5003/api/agencies/{YOUR_AGENCY_ID}/logo \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -F "logo=@/path/to/logo.png"
```

**Using Frontend (React Example):**

```javascript
const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await fetch(`http://localhost:5003/api/agencies/${agencyId}/logo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const result = await response.json();
  console.log('Logo uploaded:', result.agency.logo_path);
};
```

### Step 3: View Your Logo

Your logo will be accessible at:
```
http://localhost:5003/uploads/logos/agency_{YOUR_ID}_{timestamp}.{ext}
```

Or fetch your agency details:
```bash
curl http://localhost:5003/api/agencies/{YOUR_AGENCY_ID}
```

Response will include:
```json
{
  "id": 1,
  "name": "Your Agency Name",
  "created_at": "2024-01-01T00:00:00.000Z",
  "logo_path": "/uploads/logos/agency_1_1234567890.png"
}
```

### Step 4: Update Logo (Optional)

Simply upload a new logo using the same endpoint. The old logo will be automatically deleted.

### Step 5: Delete Logo (Optional)

```bash
curl -X DELETE http://localhost:5003/api/agencies/{YOUR_AGENCY_ID}/logo \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
```

---

## Logo Requirements

✅ **Supported Formats:**
- JPG/JPEG
- PNG
- SVG
- WEBP

✅ **File Size:**
- Maximum: 5MB

✅ **Recommended Dimensions:**
- Width: 200-400px
- Height: 50-100px
- Aspect Ratio: 2:1 to 4:1 (landscape)

---

## Common Issues & Solutions

### Issue: "No file uploaded"
**Solution:** Make sure you're sending the file in the `logo` field of the form data.

### Issue: "Invalid file type"
**Solution:** Only JPG, PNG, SVG, and WEBP files are accepted. Convert your file to one of these formats.

### Issue: "File size too large"
**Solution:** Compress your image to be under 5MB. Use online tools like TinyPNG or ImageOptim.

### Issue: "You can only upload logo for your own agency"
**Solution:** As an agency admin, you can only upload logos for your own agency. Contact a system admin if you need to upload for a different agency.

### Issue: "Agency not found"
**Solution:** Verify the agency ID in the URL is correct.

---

## Testing Your Implementation

### 1. Check if migration ran successfully:
```bash
node migrations/addAgencyLogoColumn.js
```

Expected output:
```
✅ Added logo_path column to agencies table
✅ Migration completed successfully!
```

### 2. Start the server:
```bash
npm start
```

Expected output:
```
✅ Server running on port 5003
✅ Connected to SQLite database
```

### 3. Test the upload endpoint:
```bash
# Create a test image file first, then:
curl -X POST http://localhost:5003/api/agencies/1/logo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@test-logo.png"
```

### 4. Verify the logo was saved:
- Check `uploads/logos/` directory for the file
- Access the logo via browser: `http://localhost:5003/uploads/logos/agency_1_xxxxx.png`

---

## Integration with Frontend

### Display Logo in Header
```jsx
import { useState, useEffect } from 'react';

function Header() {
  const [agency, setAgency] = useState(null);
  const agencyId = localStorage.getItem('agencyId');
  
  useEffect(() => {
    fetch(`http://localhost:5003/api/agencies/${agencyId}`)
      .then(res => res.json())
      .then(data => setAgency(data));
  }, [agencyId]);
  
  return (
    <header>
      {agency?.logo_path && (
        <img 
          src={`http://localhost:5003${agency.logo_path}`}
          alt={agency.name}
          style={{ height: '50px' }}
        />
      )}
    </header>
  );
}
```

### Logo Upload Component
```jsx
function LogoUploader({ agencyId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const res = await fetch(`http://localhost:5003/api/agencies/${agencyId}/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await res.json();
      onSuccess(data.agency);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Logo'}
      </button>
    </div>
  );
}
```

---

## Support

For issues or questions:
1. Check the comprehensive documentation in `AGENCY_LOGO_FEATURE.md`
2. Review API endpoints in `API_ENDPOINTS_LOGO.md`
3. Check implementation details in `IMPLEMENTATION_SUMMARY.md`

---

## Success! 🎉

Your agency logo upload feature is ready to use. Agency admins can now upload their company logos for white labelling the payroll portal!
