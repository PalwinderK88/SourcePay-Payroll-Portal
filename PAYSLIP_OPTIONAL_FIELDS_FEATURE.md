# 💰 Payslip Optional Fields Feature

## Overview
Added three optional fields to the payslip upload system: **Holiday Pay**, **Sick Pay**, and **Expenses**. These fields allow for more detailed payroll tracking while remaining optional.

## ✅ Changes Made

### 1. Database Schema Update
**File:** `Backend/addPayslipOptionalFields.js`
- Added `holiday_pay` column (REAL, nullable)
- Added `sick_pay` column (REAL, nullable)
- Added `expenses` column (REAL, nullable)

**Updated Table Structure:**
```sql
payslips (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  month TEXT,
  year INTEGER,
  amount REAL,
  file_name TEXT,
  file_path TEXT,
  uploaded_at DATETIME,
  holiday_pay REAL,      -- NEW
  sick_pay REAL,         -- NEW
  expenses REAL          -- NEW
)
```

### 2. Backend Model Update
**File:** `Backend/Models/Payslip.js`
- Updated `create()` method to accept optional parameters:
  - `holiday_pay` (default: null)
  - `sick_pay` (default: null)
  - `expenses` (default: null)
- Modified INSERT query to include new fields
- Updated return object to include new fields

### 3. Backend Controller Update
**File:** `Backend/Controllers/payslipController.js`
- Updated `uploadPayslip()` to extract new fields from request body
- Pass optional fields to `Payslip.create()` method
- Fields are only included if provided (null otherwise)

### 4. Frontend Upload Component Update
**File:** `Frontend/Components/UploadPayslip.js`

**New State Variables:**
```javascript
const [holidayPay, setHolidayPay] = useState('');
const [sickPay, setSickPay] = useState('');
const [expenses, setExpenses] = useState('');
```

**New UI Section:**
- Added "Additional Payments (Optional)" section
- Three input fields in a responsive grid layout:
  - Holiday Pay input
  - Sick Pay input
  - Expenses input
- All fields accept decimal numbers (step="0.01")
- Fields are only sent to backend if filled

**Form Submission:**
```javascript
if (holidayPay) formData.append('holiday_pay', holidayPay);
if (sickPay) formData.append('sick_pay', sickPay);
if (expenses) formData.append('expenses', expenses);
```

### 5. Frontend Display Component Update
**File:** `Frontend/Components/PayslipList.js`

**Enhanced Table Display:**
- Added columns for Holiday Pay, Sick Pay, and Expenses
- Added `formatCurrency()` helper function
- Shows "-" for empty/null values
- Shows "£X.XX" format for populated values
- Improved styling with hover effects
- Better responsive design

**Table Columns:**
1. Period (Month Year)
2. Amount
3. Holiday Pay
4. Sick Pay
5. Expenses
6. Download

## 🎯 Features

### Optional Fields
- ✅ All three fields are **completely optional**
- ✅ Can be left blank during upload
- ✅ Display shows "-" when not provided
- ✅ No validation required

### Currency Formatting
- ✅ Displays as "£X.XX" format
- ✅ Shows 2 decimal places
- ✅ Handles null/empty values gracefully

### User Experience
- ✅ Clear section header: "Additional Payments (Optional)"
- ✅ Responsive grid layout (3 columns on desktop, 1 on mobile)
- ✅ Placeholder text for guidance
- ✅ Consistent styling with existing fields

## 📊 Usage Example

### Uploading a Payslip with Optional Fields

**Scenario 1: Full Details**
```
Employee: John Doe
Period: January 2025
Amount: £5000.00
Holiday Pay: £500.00
Sick Pay: £300.00
Expenses: £150.00
```

**Scenario 2: Partial Details**
```
Employee: Jane Smith
Period: February 2025
Amount: £4500.00
Holiday Pay: £400.00
Sick Pay: (empty)
Expenses: (empty)
```

**Scenario 3: No Optional Fields**
```
Employee: Bob Johnson
Period: March 2025
Amount: £5200.00
Holiday Pay: (empty)
Sick Pay: (empty)
Expenses: (empty)
```

### Display in Payslip List

| Period | Amount | Holiday Pay | Sick Pay | Expenses | Download |
|--------|--------|-------------|----------|----------|----------|
| January 2025 | £5000.00 | £500.00 | £300.00 | £150.00 | Download PDF |
| February 2025 | £4500.00 | £400.00 | - | - | Download PDF |
| March 2025 | £5200.00 | - | - | - | Download PDF |

## 🔧 Technical Details

### Database Migration
Run the migration script to add columns:
```bash
node Backend/addPayslipOptionalFields.js
```

### API Request Format
```javascript
POST /api/payslips/upload
Content-Type: multipart/form-data

{
  user_id: 1,
  period_type: "monthly",
  month: "January",
  year: 2025,
  amount: 5000.00,
  holiday_pay: 500.00,    // Optional
  sick_pay: 300.00,       // Optional
  expenses: 150.00,       // Optional
  file: [PDF file]
}
```

### API Response Format
```json
{
  "id": 1,
  "user_id": 1,
  "month": "January",
  "year": 2025,
  "amount": 5000.00,
  "holiday_pay": 500.00,
  "sick_pay": 300.00,
  "expenses": 150.00,
  "file_name": "payslip.pdf",
  "file_path": "/uploads/payslips/1_January_2025_123456_payslip.pdf",
  "uploaded_at": "2025-01-15T10:30:00.000Z"
}
```

## ✅ Testing Checklist

- [x] Database columns added successfully
- [x] Backend model accepts optional parameters
- [x] Backend controller processes optional fields
- [x] Frontend form includes new input fields
- [x] Frontend form submits optional fields correctly
- [x] Frontend display shows optional fields
- [x] Currency formatting works correctly
- [x] Empty values display as "-"
- [x] Responsive design works on mobile
- [x] Existing payslips without optional fields display correctly

## 🎉 Benefits

1. **More Detailed Tracking**: Separate tracking of different payment types
2. **Flexibility**: Fields are optional, no forced data entry
3. **Better Reporting**: Can analyze holiday pay, sick pay, and expenses separately
4. **User-Friendly**: Clear labeling and intuitive interface
5. **Backward Compatible**: Existing payslips without these fields still work

## 📝 Files Modified

1. `Backend/addPayslipOptionalFields.js` - Database migration script (NEW)
2. `Backend/checkPayslipsTableStructure.js` - Verification script (NEW)
3. `Backend/Models/Payslip.js` - Model update
4. `Backend/Controllers/payslipController.js` - Controller update
5. `Frontend/Components/UploadPayslip.js` - Upload form update
6. `Frontend/Components/PayslipList.js` - Display component update

## 🚀 Deployment Notes

1. Run database migration before deploying code changes
2. No breaking changes - existing functionality preserved
3. All new fields are optional - no data migration needed
4. Frontend and backend changes should be deployed together

---

**Feature Status:** ✅ Complete and Ready for Use
