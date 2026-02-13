# Agency Logo Upload Feature - Implementation Checklist

## Task: Add logo upload functionality for agency admins (white labelling)

### Steps to Complete:

- [x] 1. Create database migration to add logo_path column to agencies table
- [x] 2. Update Agency model (models/Agency.js) to include logo operations
- [x] 3. Update Agency controller (controllers/agencyController.js) to add logo upload/delete methods
- [x] 4. Update Agency routes (routes/agencies.js) to add logo endpoints
- [x] 5. Run migration script to update database
- [x] 6. Implementation complete!

### Current Status: ✅ Implementation Complete!

---

## Implementation Details:

### Authorization Rules:
- Agency Admin: Can upload/update/delete logo ONLY for their own agency
- System Admin: Can upload/update/delete logo for ANY agency

### File Specifications:
- Allowed formats: JPG, JPEG, PNG, SVG, WEBP
- Max file size: 5MB
- Storage location: uploads/logos/
- Naming convention: agency_{agencyId}_{timestamp}_{originalName}

### API Endpoints:
- POST /api/agencies/:id/logo - Upload/update agency logo
- DELETE /api/agencies/:id/logo - Delete agency logo
- GET /api/agencies/:id - Get agency details (includes logo_path)
