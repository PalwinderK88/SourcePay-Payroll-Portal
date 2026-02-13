# Agency Logo API Endpoints - Quick Reference

## Base URL
```
http://localhost:5003/api/agencies
```

## Endpoints

### 1. Upload/Update Agency Logo
```http
POST /api/agencies/:id/logo
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
logo: [File] (Image file - JPG, PNG, SVG, WEBP)
```

**Success Response (200):**
```json
{
  "message": "Logo uploaded successfully",
  "agency": {
    "id": 1,
    "name": "Agency Name",
    "created_at": "2024-01-01T00:00:00.000Z",
    "logo_path": "/uploads/logos/agency_1_1234567890.png"
  }
}
```

**Error Responses:**
- `400` - No file uploaded / Invalid file type / File too large
- `403` - Unauthorized (agency_admin trying to upload for different agency)
- `404` - Agency not found
- `500` - Server error

---

### 2. Get Agency Details (with logo)
```http
GET /api/agencies/:id
```

**Headers:**
```
None (Public endpoint)
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "Agency Name",
  "created_at": "2024-01-01T00:00:00.000Z",
  "logo_path": "/uploads/logos/agency_1_1234567890.png"
}
```

**Error Responses:**
- `404` - Agency not found
- `500` - Server error

---

### 3. Delete Agency Logo
```http
DELETE /api/agencies/:id/logo
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Success Response (200):**
```json
{
  "message": "Logo deleted successfully",
  "agency": {
    "id": 1,
    "name": "Agency Name",
    "created_at": "2024-01-01T00:00:00.000Z",
    "logo_path": null
  }
}
```

**Error Responses:**
- `403` - Unauthorized (agency_admin trying to delete for different agency)
- `404` - Agency not found / No logo found
- `500` - Server error

---

### 4. Get All Agencies (with logos)
```http
GET /api/agencies
```

**Headers:**
```
None (Public endpoint)
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Agency 1",
    "created_at": "2024-01-01T00:00:00.000Z",
    "logo_path": "/uploads/logos/agency_1_1234567890.png"
  },
  {
    "id": 2,
    "name": "Agency 2",
    "created_at": "2024-01-01T00:00:00.000Z",
    "logo_path": null
  }
]
```

---

## Access Uploaded Logos

Logos are served statically via:
```
http://localhost:5003{logo_path}
```

**Example:**
```
http://localhost:5003/uploads/logos/agency_1_1234567890.png
```

---

## Postman Collection Examples

### Upload Logo
```javascript
// Postman: POST request
URL: http://localhost:5003/api/agencies/1/logo
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Body: form-data
  logo: [Select File]
```

### Get Agency with Logo
```javascript
// Postman: GET request
URL: http://localhost:5003/api/agencies/1
Headers: None
```

### Delete Logo
```javascript
// Postman: DELETE request
URL: http://localhost:5003/api/agencies/1/logo
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## cURL Examples

### Upload Logo
```bash
curl -X POST http://localhost:5003/api/agencies/1/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "logo=@/path/to/your/logo.png"
```

### Get Agency
```bash
curl http://localhost:5003/api/agencies/1
```

### Delete Logo
```bash
curl -X DELETE http://localhost:5003/api/agencies/1/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Validation Rules

### File Type
- Allowed: JPG, JPEG, PNG, SVG, WEBP
- MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/svg+xml`, `image/webp`

### File Size
- Maximum: 5MB (5,242,880 bytes)

### Authorization
- **Agency Admin**: Can only manage logo for their own agency (`user.agency_id === agency.id`)
- **System Admin**: Can manage logo for any agency

---

## Common Error Messages

| Error | Message | Solution |
|-------|---------|----------|
| 400 | "No file uploaded" | Include a file in the `logo` field |
| 400 | "Invalid file type. Only JPG, JPEG, PNG, SVG, and WEBP are allowed" | Upload a valid image file |
| 400 | "File size too large. Maximum size is 5MB" | Reduce file size or compress image |
| 403 | "You can only upload logo for your own agency" | Agency admin trying to upload for different agency |
| 404 | "Agency not found" | Check agency ID exists |
| 404 | "No logo found for this agency" | Trying to delete non-existent logo |
