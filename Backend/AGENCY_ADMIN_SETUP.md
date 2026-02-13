# Agency Admin Setup & Users Table Structure

## 📊 Users Table Structure

The users table has the following columns:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'contractor',
  agency_id INTEGER,                    -- Links user to agency
  agency_name TEXT,                     -- Agency name for display
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reset_token TEXT,
  reset_token_expiry INTEGER,
  FOREIGN KEY (agency_id) REFERENCES agencies(id)
);
```

## 👥 Current Agency Admin in Database

Based on the current database, you have:

**Agency Admin User:**
- **Name:** Agency Admin User
- **Email:** agencyadmin@test.com
- **Role:** agency_admin
- **Agency ID:** 1
- **Agency Name:** XTP Recruitment Ltd
- **Status:** active

This agency admin can now upload a logo for **Agency ID: 1 (XTP Recruitment Ltd)**.

## 🔐 User Roles

The system supports the following roles:

| Role | Description | Logo Upload Permission |
|------|-------------|----------------------|
| **admin** | System administrator | Can upload logo for ANY agency |
| **agency_admin** | Agency administrator | Can upload logo ONLY for their own agency |
| **contractor** | Regular contractor | Cannot upload logos |

## 🎯 How Agency Admin Logo Upload Works

### 1. Agency Admin Login
```javascript
POST /api/auth/login
{
  "email": "agencyadmin@test.com",
  "password": "their_password"
}

Response:
{
  "token": "JWT_TOKEN",
  "user": {
    "id": 2,
    "name": "Agency Admin User",
    "email": "agencyadmin@test.com",
    "role": "agency_admin",
    "agency_id": 1,
    "agency_name": "XTP Recruitment Ltd"
  }
}
```

### 2. Upload Logo for Their Agency
The agency admin can upload a logo for their agency (ID: 1):

```bash
curl -X POST http://localhost:5003/api/agencies/1/logo \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "logo=@company-logo.png"
```

**Authorization Check:**
- The system checks if `user.agency_id === 1` (the agency they're uploading for)
- If yes → Upload succeeds ✅
- If no → Returns 403 Forbidden ❌

### 3. View Their Agency Logo
```bash
curl http://localhost:5003/api/agencies/1

Response:
{
  "id": 1,
  "name": "XTP Recruitment Ltd",
  "created_at": "2024-01-01T00:00:00.000Z",
  "logo_path": "/uploads/logos/agency_1_1234567890.png"
}
```

### 4. Delete Their Agency Logo
```bash
curl -X DELETE http://localhost:5003/api/agencies/1/logo \
  -H "Authorization: Bearer JWT_TOKEN"
```

## 📝 Creating Additional Agency Admins

### Method 1: Using the API (Recommended)

```javascript
// System admin creates a new agency admin
POST /api/users
Headers: { Authorization: Bearer ADMIN_JWT_TOKEN }
Body:
{
  "name": "New Agency Admin",
  "email": "newadmin@agency.com",
  "password": "secure_password",
  "role": "agency_admin",
  "agency_id": 2,
  "agency_name": "Another Agency Ltd"
}
```

### Method 2: Direct Database Insert

Create a script to add agency admin:

```javascript
const User = require('./models/user');

async function createAgencyAdmin() {
  const admin = await User.create(
    'Admin Name',
    'admin@agency.com',
    'password123',
    'agency_admin',
    2,  // agency_id
    'Agency Name'
  );
  console.log('Agency admin created:', admin);
}

createAgencyAdmin();
```

## 🔍 Checking Agency Admins

Run the provided script to see all agency admins:

```bash
node checkAgencyAdmins.js
```

This will show:
- Users table structure
- All agency admins with their details
- Summary of all users by role

## 🎨 Frontend Integration for Agency Admin Dashboard

### Display Agency Admin Info
```javascript
// After login, store user info
const user = response.data.user;
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('token', response.data.token);

// In dashboard component
const user = JSON.parse(localStorage.getItem('user'));
console.log('Agency Admin:', user.name);
console.log('Agency:', user.agency_name);
console.log('Agency ID:', user.agency_id);
```

### Upload Logo Component
```javascript
function AgencyLogoUpload() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const [agency, setAgency] = useState(null);
  
  useEffect(() => {
    // Fetch agency details including current logo
    fetch(`http://localhost:5003/api/agencies/${user.agency_id}`)
      .then(res => res.json())
      .then(data => setAgency(data));
  }, [user.agency_id]);
  
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(
      `http://localhost:5003/api/agencies/${user.agency_id}/logo`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      }
    );
    
    const result = await response.json();
    setAgency(result.agency);
  };
  
  return (
    <div>
      <h2>Agency Logo - {user.agency_name}</h2>
      
      {agency?.logo_path ? (
        <div>
          <img 
            src={`http://localhost:5003${agency.logo_path}`}
            alt={agency.name}
            style={{ maxWidth: '300px' }}
          />
          <button onClick={handleDelete}>Delete Logo</button>
        </div>
      ) : (
        <p>No logo uploaded yet</p>
      )}
      
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files[0])}
      />
    </div>
  );
}
```

## 🔒 Security Notes

### Authorization Flow
1. User logs in → Receives JWT token with user info
2. JWT contains: `{ id, email, role, agency_id }`
3. When uploading logo:
   - Backend extracts user info from JWT
   - Checks if `user.role === 'agency_admin'`
   - Checks if `user.agency_id === requested_agency_id`
   - Only allows upload if both conditions are true

### What Agency Admins CAN Do:
✅ Upload logo for their own agency
✅ Update logo for their own agency
✅ Delete logo for their own agency
✅ View their agency details

### What Agency Admins CANNOT Do:
❌ Upload logo for other agencies
❌ Delete logo for other agencies
❌ Create/delete agencies
❌ Modify other agencies' data

## 📋 Testing Agency Admin Logo Upload

### Test Case 1: Successful Upload
```bash
# 1. Login as agency admin
curl -X POST http://localhost:5003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agencyadmin@test.com","password":"password"}'

# 2. Copy the token from response

# 3. Upload logo for their agency (ID: 1)
curl -X POST http://localhost:5003/api/agencies/1/logo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@test-logo.png"

# Expected: 200 OK with updated agency object
```

### Test Case 2: Unauthorized Upload (Different Agency)
```bash
# Try to upload logo for agency ID: 2 (not their agency)
curl -X POST http://localhost:5003/api/agencies/2/logo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@test-logo.png"

# Expected: 403 Forbidden
# Message: "You can only upload logo for your own agency"
```

### Test Case 3: View Agency with Logo
```bash
curl http://localhost:5003/api/agencies/1

# Expected: Agency object with logo_path
```

## 🎯 Summary

**Current Setup:**
- ✅ 1 Agency Admin exists (agencyadmin@test.com)
- ✅ Linked to Agency ID: 1 (XTP Recruitment Ltd)
- ✅ Can upload/update/delete logo for Agency ID: 1
- ✅ Cannot modify other agencies' logos

**To Test:**
1. Login as agencyadmin@test.com
2. Upload a logo for Agency ID: 1
3. Verify logo appears in database and filesystem
4. Try uploading for Agency ID: 2 (should fail)
5. Delete the logo
6. Verify logo is removed

The agency admin logo upload feature is fully functional and ready to use!
