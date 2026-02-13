# Bulk Timesheet Upload - User Guide

## 📋 What is Step 1: Download Template?

The CSV template is a pre-formatted spreadsheet that tells you exactly what information you need to provide for each timesheet. It makes bulk uploading easy and error-free.

## 🎯 Step-by-Step Guide

### **Step 1: Download the CSV Template**

1. **Go to Agency Admin Portal**
   - Login to http://localhost:3000
   - Navigate to Agency Admin Portal

2. **Click "📦 Bulk Upload" Tab**
   - You'll see 4 tabs at the top
   - Click on "📦 Bulk Upload"

3. **Click "📥 Download CSV Template" Button**
   - This is in the first section
   - A file called `timesheet_bulk_upload_template.csv` will download
   - Save it to your computer

### **Step 2: Fill in the Template**

Open the downloaded CSV file in Excel or any spreadsheet program. You'll see these columns:

| Column Name | Description | Example | Required |
|------------|-------------|---------|----------|
| **contractor_id** | The ID number of the contractor | 2 | ✅ Yes |
| **contractor_name** | Full name of the contractor | John Doe | ✅ Yes |
| **period_type** | Either "weekly" or "monthly" | weekly | ✅ Yes |
| **week_number** | Week number (1-52) for weekly timesheets | 1 | Only for weekly |
| **month** | Month name for monthly timesheets | January | Only for monthly |
| **year** | Year of the timesheet | 2024 | ✅ Yes |
| **filename** | Name of the PDF file you'll upload | john_week1.pdf | ✅ Yes |

**Example Data:**

```csv
contractor_id,contractor_name,period_type,week_number,month,year,filename
2,John Doe,weekly,1,,2024,john_week1.pdf
3,Jane Smith,monthly,,January,2024,jane_jan.pdf
2,John Doe,weekly,2,,2024,john_week2.pdf
```

**Important Rules:**
- For **weekly** timesheets: Fill in `week_number`, leave `month` empty
- For **monthly** timesheets: Fill in `month`, leave `week_number` empty
- The `filename` must EXACTLY match the PDF file you'll upload
- Don't use special characters in filenames

### **Step 3: Prepare Your PDF Files**

1. **Gather all timesheet PDF files**
2. **Rename them to match the filenames in your CSV**
   - Example: If CSV says `john_week1.pdf`, your PDF must be named exactly that
3. **Keep all PDFs in one folder** for easy uploading

### **Step 4: Upload CSV File**

1. In the Bulk Upload page, find **"Step 2: Upload CSV File"**
2. Click **"Choose CSV/Excel File"** or drag and drop your filled CSV
3. You'll see a checkmark when it's uploaded

### **Step 5: Upload PDF Files**

1. Find **"Step 3: Upload PDF Files"**
2. Click **"Browse Files"** or drag and drop all your PDF files
3. You can select multiple PDFs at once
4. You'll see a list of all selected PDFs

### **Step 6: Upload Everything**

1. Click the **"🚀 Upload Timesheets"** button
2. Wait for the upload to complete
3. You'll see results showing:
   - ✅ Successful uploads
   - ❌ Failed uploads (with reasons)

## 💡 Tips for Success

### Finding Contractor IDs:
1. Go to the **"👥 Contractors"** tab in Agency Admin Portal
2. You'll see a list of all contractors with their IDs
3. Use these IDs in your CSV

### Common Mistakes to Avoid:
- ❌ Filename in CSV doesn't match actual PDF filename
- ❌ Missing required fields (contractor_id, contractor_name, etc.)
- ❌ Using both week_number and month (choose one based on period_type)
- ❌ Wrong period_type (must be exactly "weekly" or "monthly")
- ❌ PDF files larger than 10MB

### If Upload Fails:
1. Check the error messages - they tell you exactly what's wrong
2. Fix the issues in your CSV
3. Try uploading again
4. You can upload partial batches - successful ones won't be duplicated

## 📊 Example Scenario

**You have 3 contractors and need to upload their timesheets:**

1. **Download template** → Opens in Excel
2. **Fill in data:**
   ```
   Row 1: John (ID: 2), Week 1, 2024, john_week1.pdf
   Row 2: Jane (ID: 3), January, 2024, jane_jan.pdf  
   Row 3: Bob (ID: 4), Week 1, 2024, bob_week1.pdf
   ```
3. **Save CSV**
4. **Prepare PDFs:** john_week1.pdf, jane_jan.pdf, bob_week1.pdf
5. **Upload CSV** in the portal
6. **Upload all 3 PDFs** at once
7. **Click Upload** → See results!

## 🎉 Benefits of Bulk Upload

- ⚡ **Fast:** Upload 10, 20, or 100 timesheets at once
- 📝 **Organized:** Use Excel to manage your data
- ✅ **Validated:** System checks everything before uploading
- 🔄 **Flexible:** Partial success - some can succeed even if others fail
- 📊 **Clear Results:** See exactly what worked and what didn't

## ❓ Need Help?

If you're still unsure:
1. Try uploading just 1-2 timesheets first to test
2. Check the error messages - they're very specific
3. Make sure your browser cache is cleared (Ctrl+F5)
4. Ensure you're logged in as an agency admin

---

**The template makes it easy - just fill in the blanks and upload!** 🚀
