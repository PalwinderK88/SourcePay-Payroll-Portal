# 🔗 OctaPay Integration Guide

## Overview
This integration allows OctaPay to automatically upload payslips directly to your payroll portal, eliminating the need for manual admin uploads.

## 🎯 Features

### 1. **Single Payslip Upload**
Upload one payslip at a time via API

### 2. **Bulk Upload**
Upload multiple payslips in a single API call

### 3. **Webhook Support**
Receive real-time notifications from OctaPay

### 4. **Secure Authentication**
API key and webhook signature verification

## 🔐 Security

### API Key Authentication
All API endpoints require an API key in the request header:
```
X-API-Key: your-secure-api-key-here
```

### Webhook Signature Verification
Webhooks are verified using HMAC SHA256 signatures:
```
X-OctaPay-Signature: <signature>
```

## 📡 API Endpoints

### 1. Upload Single Payslip

**Endpoint:** `POST /api/octapay/upload-payslip`

**Headers:**
```
X-API-Key: your-secure-api-key-here
Content-Type: multipart/form-data
```

**Request Body:**
```javascript
{
  employee_email: "contractor@example.com",  // Required
  period_type: "monthly",                    // Required: "monthly" or "weekly"
  month: "January",                          // Required if monthly
  week_number: 1,                            // Required if weekly
  year: 2025,                                // Required
  amount: 5000.00,                           // Optional
  holiday_pay: 500.00,                       // Optional
  sick_pay: 300.00,                          // Optional
  expenses: 150.00,                          // Optional
  file: <PDF file>                           // Required
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payslip uploaded successfully",
  "data": {
    "payslip_id": 123,
    "employee_name": "John Doe",
    "employee_email": "contractor@example.com",
    "period": "January",
    "year": 2025,
    "amount": 5000.00,
    "holiday_pay": 500.00,
    "sick_pay": 300.00,
    "expenses": 150.00,
    "uploaded_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// 400 - Missing required fields
{
  "success": false,
  "message": "Missing required fields: employee_email, year, period_type"
}

// 404 - Employee not found
{
  "success": false,
  "message": "Employee not found with email: contractor@example.com"
}

// 401 - Invalid API key
{
  "success": false,
  "message": "Unauthorized: Invalid API key"
}
```

### 2. Bulk Upload Payslips

**Endpoint:** `POST /api/octapay/bulk-upload`

**Headers:**
```
X-API-Key: your-secure-api-key-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "payslips": [
    {
      "employee_email": "contractor1@example.com",
      "period_type": "monthly",
      "month": "January",
      "year": 2025,
      "amount": 5000.00,
      "holiday_pay": 500.00,
      "sick_pay": 300.00,
      "expenses": 150.00,
      "file_base64": "<base64 encoded PDF>",
      "file_name": "payslip.pdf"
    },
    {
      "employee_email": "contractor2@example.com",
      "period_type": "weekly",
      "week_number": 1,
      "year": 2025,
      "amount": 1200.00,
      "file_base64": "<base64 encoded PDF>",
      "file_name": "payslip.pdf"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bulk upload completed",
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": {
      "success": [
        {
          "payslip_id": 123,
          "employee_email": "contractor1@example.com",
          "employee_name": "John Doe",
          "period": "January",
          "year": 2025
        },
        {
          "payslip_id": 124,
          "employee_email": "contractor2@example.com",
          "employee_name": "Jane Smith",
          "period": "Week 1",
          "year": 2025
        }
      ],
      "failed": []
    }
  }
}
```

### 3. Webhook Endpoint

**Endpoint:** `POST /api/octapay/webhook`

**Headers:**
```
X-OctaPay-Signature: <HMAC SHA256 signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "payslip.created",
  "data": {
    "employee_email": "contractor@example.com",
    "period": "January",
    "year": 2025
  }
}
```

**Supported Events:**
- `payslip.created` - New payslip created
- `payslip.updated` - Payslip updated
- `payslip.deleted` - Payslip deleted

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook received",
  "event": "payslip.created"
}
```

### 4. Health Check

**Endpoint:** `GET /api/octapay/health`

**No authentication required**

**Response (200):**
```json
{
  "success": true,
  "message": "OctaPay integration is active",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 🔧 Setup Instructions

### 1. Environment Variables

Create or update `.env` file in Backend directory:

```env
# OctaPay Integration
OCTAPAY_API_KEY=your-secure-api-key-here
OCTAPAY_WEBHOOK_SECRET=your-webhook-secret-here
```

**Generate secure keys:**
```bash
# Generate API Key (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Webhook Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Share API Key with OctaPay

Provide OctaPay with:
- **API Endpoint:** `https://your-domain.com/api/octapay/upload-payslip`
- **API Key:** `your-secure-api-key-here`
- **Webhook URL:** `https://your-domain.com/api/octapay/webhook` (optional)
- **Webhook Secret:** `your-webhook-secret-here` (optional)

### 3. Test the Integration

```bash
# Test health check
curl https://your-domain.com/api/octapay/health

# Test single upload (from OctaPay side)
curl -X POST https://your-domain.com/api/octapay/upload-payslip \
  -H "X-API-Key: your-secure-api-key-here" \
  -F "employee_email=contractor@example.com" \
  -F "period_type=monthly" \
  -F "month=January" \
  -F "year=2025" \
  -F "amount=5000.00" \
  -F "file=@payslip.pdf"
```

## 📝 Integration Flow

### Automatic Upload Flow

```
┌─────────────┐
│   OctaPay   │
│   System    │
└──────┬──────┘
       │
       │ 1. Generate Payslip
       │
       ▼
┌─────────────────────────────────┐
│ POST /api/octapay/upload-payslip│
│ Headers: X-API-Key              │
│ Body: employee_email, file, etc │
└──────┬──────────────────────────┘
       │
       │ 2. Verify API Key
       │
       ▼
┌─────────────────────────┐
│ Find Employee by Email  │
└──────┬──────────────────┘
       │
       │ 3. Employee Found
       │
       ▼
┌─────────────────────────┐
│ Save PDF to Disk        │
│ Create Database Record  │
└──────┬──────────────────┘
       │
       │ 4. Success Response
       │
       ▼
┌─────────────────────────┐
│ Contractor Can View     │
│ Payslip in Portal       │
└─────────────────────────┘
```

## 🔍 Employee Matching

The system matches payslips to contractors using **email addresses**:

1. OctaPay sends `employee_email` in the request
2. System looks up user by email in database
3. If found and user is a contractor, payslip is uploaded
4. If not found, returns 404 error

**Important:** Ensure email addresses in OctaPay match exactly with contractor emails in your portal.

## 📊 Example Code (OctaPay Side)

### JavaScript/Node.js Example

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function uploadPayslip() {
  const form = new FormData();
  form.append('employee_email', 'contractor@example.com');
  form.append('period_type', 'monthly');
  form.append('month', 'January');
  form.append('year', '2025');
  form.append('amount', '5000.00');
  form.append('holiday_pay', '500.00');
  form.append('sick_pay', '300.00');
  form.append('expenses', '150.00');
  form.append('file', fs.createReadStream('payslip.pdf'));

  try {
    const response = await axios.post(
      'https://your-domain.com/api/octapay/upload-payslip',
      form,
      {
        headers: {
          'X-API-Key': 'your-secure-api-key-here',
          ...form.getHeaders()
        }
      }
    );
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

uploadPayslip();
```

### Python Example

```python
import requests

def upload_payslip():
    url = 'https://your-domain.com/api/octapay/upload-payslip'
    headers = {
        'X-API-Key': 'your-secure-api-key-here'
    }
    
    data = {
        'employee_email': 'contractor@example.com',
        'period_type': 'monthly',
        'month': 'January',
        'year': '2025',
        'amount': '5000.00',
        'holiday_pay': '500.00',
        'sick_pay': '300.00',
        'expenses': '150.00'
    }
    
    files = {
        'file': open('payslip.pdf', 'rb')
    }
    
    response = requests.post(url, headers=headers, data=data, files=files)
    
    if response.status_code == 200:
        print('✅ Success:', response.json())
    else:
        print('❌ Error:', response.json())

upload_payslip()
```

## 🛡️ Security Best Practices

1. **Keep API Keys Secret**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys periodically

2. **Use HTTPS**
   - Always use HTTPS in production
   - Never send API keys over HTTP

3. **Validate Webhook Signatures**
   - Always verify webhook signatures
   - Reject requests with invalid signatures

4. **Rate Limiting**
   - Consider implementing rate limiting
   - Prevent abuse of API endpoints

5. **Logging**
   - Log all API requests
   - Monitor for suspicious activity

## 📋 Troubleshooting

### Common Issues

**1. "Unauthorized: Invalid API key"**
- Check API key is correct
- Ensure header name is `X-API-Key`
- Verify API key matches environment variable

**2. "Employee not found"**
- Verify email address exists in system
- Check email spelling
- Ensure user is a contractor (not admin)

**3. "No file uploaded"**
- Ensure file is included in request
- Check file field name is `file`
- Verify file is PDF format

**4. "Month is required for monthly payslips"**
- Include `month` field for monthly payslips
- Use full month name (e.g., "January")

## 📞 Support

For integration support:
1. Check this documentation
2. Review API response error messages
3. Check server logs for detailed errors
4. Contact your system administrator

---

**Integration Status:** ✅ Ready for Production
**Last Updated:** 2025-01-15
