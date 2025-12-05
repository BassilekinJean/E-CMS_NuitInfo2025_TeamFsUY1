# ✅ Render Deployment Checklist

## Pre-Deployment Setup (Complete These First)

### 1. Environment Variables ✅
```
✅ back/.env - Updated with Render PostgreSQL credentials:
   - DB_HOST: dpg-d4p65gmuk2gs73d61fk0-a
   - DB_NAME: ecms_db_pns4
   - DB_USER: ecms_user
   - DB_PASSWORD: [RENDER_PASSWORD]
   - DB_PORT: 5432
```

### 2. GitHub Repository
- [ ] Code pushed to `deploy_back` branch
- [ ] `.gitignore` includes `.env` and `__pycache__/`
- [ ] `requirements.txt` present in root
- [ ] `build.sh` and `start.sh` created
- [ ] All changes committed and pushed

### 3. Generate Django Secret Key
```bash
# Run this command locally:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy the output for use in Render
```

## Render Setup Steps

### Step 1: Connect GitHub
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Select "Connect a repository"
- [ ] Search for: `E-CMS_NuitInfo2025_TeamFsUY1`
- [ ] Click "Connect"

### Step 2: Configure Web Service
- [ ] **Name**: `e-cms-backend`
- [ ] **Branch**: `deploy_back`
- [ ] **Runtime**: `Python 3`
- [ ] **Build Command**: `bash build.sh`
- [ ] **Start Command**: `bash start.sh`
- [ ] **Plan**: Free (or upgrade as needed)
- [ ] **Region**: Select closest to your users

### Step 3: Add Environment Variables

In Render Dashboard, add these variables:

```
SECRET_KEY = [Generated key from step above]
DEBUG = false
ALLOWED_HOSTS = e-cms-backend.onrender.com

DB_NAME = ecms_db_pns4
DB_USER = ecms_user
DB_PASSWORD = [Your Render PostgreSQL password]
DB_HOST = dpg-d4p65gmuk2gs73d61fk0-a
DB_PORT = 5432

EMAIL_BACKEND = django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_HOST_USER = cmsmaire@gmail.com
EMAIL_HOST_PASSWORD = [Your Gmail app password]
EMAIL_USE_TLS = true
DEFAULT_FROM_EMAIL = cmsmaire@gmail.com
```

### Step 4: Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Check logs for errors
- [ ] Verify status shows "Live" ✅

## Post-Deployment Verification

### 1. Test Backend URL
```bash
# Your backend URL will be shown after deployment
curl https://e-cms-backend.onrender.com/api/v1/auth/login -X POST
```

### 2. Check Logs
- [ ] Go to Web Service → Logs
- [ ] Look for "Starting development server" or Gunicorn startup message
- [ ] No error messages visible
- [ ] "Listening on port 8000" or similar

### 3. Verify Database Connection
```bash
# If you have admin access:
curl https://e-cms-backend.onrender.com/admin/
```

### 4. Test Authentication Endpoint
```bash
curl https://e-cms-backend.onrender.com/api/v1/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### 5. Monitor for Issues
- [ ] Check logs regularly for errors
- [ ] Monitor database connections
- [ ] Check CPU/Memory usage
- [ ] Verify email sending is working

## Common Issues & Quick Fixes

### ❌ Build fails with "requirements.txt not found"
**Fix**: Verify root `requirements.txt` exists
```bash
ls -la requirements.txt
```

### ❌ Build fails with Python version error
**Fix**: Set Python version in `render.yaml`:
```yaml
pythonVersion: 3.13
```

### ❌ Database connection error
**Fix**: Check environment variables in Render dashboard match exactly:
```
DB_HOST=dpg-d4p65gmuk2gs73d61fk0-a
DB_NAME=ecms_db_pns4
DB_USER=ecms_user
```

### ❌ Port/Address already in use
**Fix**: Render automatically manages ports, no action needed

### ❌ Email not sending
**Fix**: Verify Gmail app password (not regular password):
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use that password in Render

## Deployed Files

| File | Purpose | Status |
|------|---------|--------|
| `requirements.txt` | Python dependencies | ✅ Ready |
| `build.sh` | Build script for Render | ✅ Created |
| `start.sh` | Start script for Render | ✅ Created |
| `render.yaml` | Render configuration | ✅ Created |
| `RENDER_DEPLOYMENT_GUIDE.md` | Detailed guide | ✅ Created |
| `back/.env` | Environment variables | ✅ Updated |
| `.gitignore` | Git ignore rules | ✅ Verified |

## After Successful Deployment

### 1. Update Frontend
Tell your frontend team to use: `https://e-cms-backend.onrender.com/api/v1`

### 2. Monitor Deployment
- [ ] Set up log alerts in Render
- [ ] Monitor database performance
- [ ] Track API response times

### 3. Scale if Needed
- [ ] Monitor free plan performance
- [ ] Upgrade to paid plan if needed
- [ ] Enable auto-scaling (paid plans)

### 4. Set Up Custom Domain (Optional)
- [ ] Go to Service Settings → Custom Domain
- [ ] Add your domain (e.g., `api.example.com`)
- [ ] Configure DNS records
- [ ] SSL certificate auto-generated

## Support Resources

- **Render Docs**: https://render.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/4.2/howto/deployment/
- **PostgreSQL**: https://www.postgresql.org/docs/

## Notes

- Database is hosted on Render PostgreSQL (included)
- Email sent via Gmail SMTP
- Static files collected during build
- Migrations run automatically during build
- Service auto-restarts if crashes
- Free plan pauses after 15 min inactivity

---

**Created**: December 5, 2025  
**Status**: 🟢 Ready to Deploy  
**Next Action**: Follow "Render Setup Steps" above
