# 🚀 Deployment Guide - Making Your Payroll Portal Live

This guide will help you deploy your Payroll Portal to the internet so users can access it from anywhere.

---

## 📋 Table of Contents

1. [Deployment Options](#deployment-options)
2. [Option 1: Vercel + Railway (Recommended - Free)](#option-1-vercel--railway-recommended)
3. [Option 2: Heroku (Easy)](#option-2-heroku)
4. [Option 3: AWS (Professional)](#option-3-aws)
5. [Option 4: DigitalOcean (Affordable)](#option-4-digitalocean)
6. [Database Migration](#database-migration)
7. [Environment Variables](#environment-variables)
8. [Custom Domain Setup](#custom-domain-setup)
9. [Security Checklist](#security-checklist)

---

## 🎯 Deployment Options

### Quick Comparison

| Platform | Frontend | Backend | Database | Cost | Difficulty |
|----------|----------|---------|----------|------|------------|
| **Vercel + Railway** | ✅ | ✅ | ✅ | Free tier | Easy |
| **Heroku** | ✅ | ✅ | ✅ | $7/month | Easy |
| **AWS** | ✅ | ✅ | ✅ | ~$20/month | Medium |
| **DigitalOcean** | ✅ | ✅ | ✅ | $12/month | Medium |

---

## Option 1: Vercel + Railway (Recommended - Free)

### ✅ Best for: Small to medium teams, free tier available

### Step 1: Prepare Your Code

1. **Create a GitHub repository**
```bash
cd "C:/Users/Admin/Documents/Payroll Portal"
git init
git add .
git commit -m "Initial commit - Payroll Portal"
```

2. **Push to GitHub**
- Create a new repository on GitHub.com
- Follow GitHub's instructions to push your code

### Step 2: Deploy Backend on Railway

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `Backend` folder

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will create a database automatically

4. **Configure Environment Variables**
   - Click on your backend service
   - Go to "Variables" tab
   - Add these variables:
   ```
   DATABASE_URL=<Railway will provide this>
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=5001
   NODE_ENV=production
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Note your backend URL (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend on Vercel

1. **Sign up for Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select the `Frontend` folder as root directory

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - You'll get a URL like `https://your-app.vercel.app`

### Step 4: Update Backend CORS

Update `Backend/server.js` to allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```

Commit and push changes - Railway will auto-deploy.

---

## Option 2: Heroku

### Step 1: Install Heroku CLI

```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
# Or use npm
npm install -g heroku
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Deploy Backend

```bash
cd Backend

# Create Heroku app
heroku create your-payroll-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a your-payroll-backend
git push heroku main
```

### Step 4: Deploy Frontend

```bash
cd Frontend

# Create Heroku app
heroku create your-payroll-frontend

# Set environment variables
heroku config:set NEXT_PUBLIC_API_URL=https://your-payroll-backend.herokuapp.com

# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git init
git add .
git commit -m "Deploy frontend"
heroku git:remote -a your-payroll-frontend
git push heroku main
```

---

## Option 3: AWS (Professional Setup)

### Services Needed:
- **EC2** - For backend server
- **RDS** - For PostgreSQL database
- **S3** - For file storage (payslips, documents)
- **CloudFront** - For frontend (optional)
- **Route 53** - For custom domain

### Step 1: Setup RDS (Database)

1. Go to AWS RDS Console
2. Create PostgreSQL database
3. Choose "Free tier" or appropriate size
4. Note connection details

### Step 2: Setup EC2 (Backend)

1. Launch EC2 instance (Ubuntu 22.04)
2. SSH into instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

4. Clone and setup backend:
```bash
git clone your-repo-url
cd Backend
npm install
```

5. Create `.env` file:
```bash
nano .env
```
Add:
```
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/dbname
JWT_SECRET=your-secret
PORT=5001
NODE_ENV=production
```

6. Start with PM2:
```bash
pm2 start server.js --name payroll-backend
pm2 startup
pm2 save
```

### Step 3: Setup S3 (File Storage)

1. Create S3 bucket for payslips
2. Configure bucket policy for private access
3. Update backend to use S3 for file uploads

### Step 4: Deploy Frontend

**Option A: Vercel (Easiest)**
- Follow Vercel steps above
- Point API URL to your EC2 backend

**Option B: S3 + CloudFront**
1. Build frontend:
```bash
cd Frontend
npm run build
```
2. Upload to S3
3. Configure CloudFront distribution

---

## Option 4: DigitalOcean

### Step 1: Create Droplet

1. Go to DigitalOcean
2. Create Droplet (Ubuntu 22.04)
3. Choose $12/month plan

### Step 2: Setup Server

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install postgresql postgresql-contrib

# Install Nginx
apt-get install nginx

# Install PM2
npm install -g pm2
```

### Step 3: Setup Database

```bash
sudo -u postgres psql

CREATE DATABASE payroll;
CREATE USER payrolluser WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE payroll TO payrolluser;
\q
```

### Step 4: Deploy Backend

```bash
cd /var/www
git clone your-repo-url payroll
cd payroll/Backend
npm install

# Create .env
nano .env
```

Add:
```
DB_USER=payrolluser
DB_HOST=localhost
DB_NAME=payroll
DB_PASSWORD=your-password
DB_PORT=5432
JWT_SECRET=your-secret
PORT=5001
```

Start backend:
```bash
pm2 start server.js --name payroll-backend
pm2 startup
pm2 save
```

### Step 5: Setup Nginx

```bash
nano /etc/nginx/sites-available/payroll
```

Add:
```nginx
# Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/payroll/Frontend/.next;
    index index.html;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/payroll /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 6: Deploy Frontend

```bash
cd /var/www/payroll/Frontend
npm install
npm run build

# Start with PM2
pm2 start npm --name "payroll-frontend" -- start
pm2 save
```

---

## 🔄 Database Migration

### From SQLite to PostgreSQL

1. **Export data from SQLite**
```bash
cd Backend
node -e "
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./payroll.db');
db.all('SELECT * FROM users', (err, rows) => {
  console.log(JSON.stringify(rows));
});
"
```

2. **Import to PostgreSQL**
- Use the data to create INSERT statements
- Or use a migration tool like `pgloader`

### Update Database Configuration

Update `Backend/config/db.js` for PostgreSQL:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
# OR individual variables
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Server
PORT=5001
NODE_ENV=production

# File Upload (if using S3)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=your-bucket
AWS_REGION=us-east-1
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 🌐 Custom Domain Setup

### Step 1: Buy Domain
- Namecheap, GoDaddy, or Google Domains
- Example: `payroll.yourcompany.com`

### Step 2: Configure DNS

Add these DNS records:

```
Type    Name    Value                           TTL
A       @       your-server-ip                  3600
A       www     your-server-ip                  3600
CNAME   api     your-backend-url.com            3600
```

For Vercel:
```
Type    Name    Value                           TTL
CNAME   @       cname.vercel-dns.com            3600
CNAME   www     cname.vercel-dns.com            3600
```

### Step 3: SSL Certificate (HTTPS)

**Using Let's Encrypt (Free):**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🔒 Security Checklist

### Before Going Live:

- [ ] Change all default passwords
- [ ] Update JWT_SECRET to strong random string
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Set up backup system
- [ ] Configure logging
- [ ] Test all functionality
- [ ] Set up monitoring (e.g., UptimeRobot)

### Update Backend Security

```javascript
// Backend/server.js

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## 📊 Monitoring & Maintenance

### Setup Monitoring

1. **UptimeRobot** (Free)
   - Monitor if site is up
   - Get alerts via email/SMS

2. **LogRocket** or **Sentry**
   - Track errors
   - Monitor performance

3. **Google Analytics**
   - Track usage
   - User analytics

### Regular Maintenance

- [ ] Weekly: Check logs for errors
- [ ] Monthly: Update dependencies
- [ ] Monthly: Backup database
- [ ] Quarterly: Security audit
- [ ] Yearly: Review and optimize

---

## 🚀 Quick Start Deployment (Recommended)

### Fastest Way to Go Live:

1. **Push code to GitHub**
2. **Deploy Backend on Railway** (5 minutes)
   - Connect GitHub
   - Add PostgreSQL
   - Set environment variables
3. **Deploy Frontend on Vercel** (5 minutes)
   - Connect GitHub
   - Set API URL
   - Deploy
4. **Done!** Your portal is live

**Total Time: ~15 minutes**

---

## 📞 Support & Resources

### Documentation:
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app
- Heroku: https://devcenter.heroku.com
- AWS: https://docs.aws.amazon.com
- DigitalOcean: https://docs.digitalocean.com

### Need Help?
- Check deployment logs
- Review error messages
- Test locally first
- Use deployment platform's support

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Test login functionality
- [ ] Test user registration
- [ ] Test payslip upload
- [ ] Test payslip download
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Verify email notifications (if configured)
- [ ] Check database connections
- [ ] Verify file uploads work
- [ ] Test admin panel functions
- [ ] Set up automated backups
- [ ] Configure monitoring alerts
- [ ] Update documentation with live URLs
- [ ] Train users on new system

---

**Your portal is ready to go live! Choose the deployment option that best fits your needs and budget.** 🎉

**Recommended for beginners: Vercel + Railway (Free tier available)**
