# Navigation Error Fix

## Problem
Next.js requires the pages directory to be lowercase `pages`, but your project has `Pages` (capital P). This causes navigation errors.

## Solution

You have two options:

### Option 1: Restart Next.js Dev Server (Quick Fix)
1. Stop the Next.js dev server (Ctrl+C in the terminal)
2. Delete the `.next` folder in the Frontend directory
3. Restart the dev server:
   ```bash
   cd Frontend
   npm run dev
   ```

### Option 2: Rename Directory (Permanent Fix)
If Option 1 doesn't work, rename the directory:

**On Windows:**
```bash
cd Frontend
# Rename to temporary name first (Windows is case-insensitive)
ren Pages Pages_temp
ren Pages_temp pages
```

**On Mac/Linux:**
```bash
cd Frontend
mv Pages pages
```

Then restart the dev server:
```bash
npm run dev
```

## After Fix

Once fixed, all navigation should work:
- http://localhost:3000/ (Home)
- http://localhost:3000/login (Login)
- http://localhost:3000/signup (Signup)
- http://localhost:3000/dashboard (Dashboard)
- http://localhost:3000/documents (Documents)
- http://localhost:3000/admin (Admin Panel)

## Note
The issue occurs because:
- Next.js looks for a `pages` directory (lowercase)
- Your project has `Pages` (capital P)
- On case-sensitive file systems, these are different directories
- Windows is case-insensitive, so it might work, but the build cache (.next) might have issues
