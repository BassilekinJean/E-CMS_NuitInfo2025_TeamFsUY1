# 🚀 Render Deployment Guide - E-CMS Backend

## Overview
This guide explains how to deploy the E-CMS Django backend to Render.com

## Prerequisites
- ✅ GitHub repository (https://github.com/BassilekinJean/E-CMS_NuitInfo2025_TeamFsUY1)
- ✅ Render account (https://render.com)
- ✅ PostgreSQL database from Render
- ✅ Environment variables configured

## Current Status

**Database Connection Details (Render):**
```
Hostname: dpg-d4p65gmuk2gs73d61fk0-a
Port: 5432
Database: ecms_db_pns4
Username: ecms_user
Password: [Your Render password]
```

## Deployment Steps

### Step 1: Connect GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect a repository"**
4. Search for: `E-CMS_NuitInfo2025_TeamFsUY1`
5. Click **"Connect"**

### Step 2: Configure Deployment Settings

**Basic Settings:**
- **Name**: `e-cms-backend`
- **Branch**: `deploy_back` (or your main deployment branch)
- **Runtime**: `Python 3`
- **Build Command**: `bash build.sh`
- **Start Command**: `bash start.sh`
- **Plan**: Free or paid (choose based on needs)
- **Region**: Choose closest to users

### Step 3: Set Environment Variables

Click **"Add Secret File"** and add these variables:

| Key | Value | Source |
|-----|-------|--------|
| `SECRET_KEY` | Generate new key | Generate a new Django secret |
| `DEBUG` | `false` | Security |
| `ALLOWED_HOSTS` | Your Render URL | e.g., `e-cms-backend.onrender.com` |
| `DB_NAME` | `ecms_db_pns4` | From Render PostgreSQL |
| `DB_USER` | `ecms_user` | From Render PostgreSQL |
| `DB_PASSWORD` | Your password | From Render PostgreSQL |
| `DB_HOST` | `dpg-d4p65gmuk2gs73d61fk0-a` | From Render PostgreSQL |
| `DB_PORT` | `5432` | Render default |
| `EMAIL_BACKEND` | `django.core.mail.backends.smtp.EmailBackend` | Gmail SMTP |
| `EMAIL_HOST` | `smtp.gmail.com` | Gmail server |
| `EMAIL_PORT` | `587` | Gmail port |
| `EMAIL_HOST_USER` | `cmsmaire@gmail.com` | Your email |
| `EMAIL_HOST_PASSWORD` | Your app password | Gmail app password |
| `EMAIL_USE_TLS` | `true` | Gmail security |
| `DEFAULT_FROM_EMAIL` | `cmsmaire@gmail.com` | Your email |

### Step 4: Generate Django Secret Key

Run this command locally:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and paste it as `SECRET_KEY` in Render environment variables.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies from `requirements.txt`
   - Run `build.sh` (migrations, static files)
   - Run `start.sh` (Gunicorn server)

3. Monitor deployment logs at: **Logs** tab
4. Once "Live" status appears, your backend is deployed! ✅

## Access Your Backend

**Production URL**: `https://e-cms-backend.onrender.com/api/v1`

## Testing Endpoints

```bash
# Test server status
curl https://e-cms-backend.onrender.com/api/v1/auth/login -X POST

# Test with API documentation (if enabled)
curl https://e-cms-backend.onrender.com/api/docs/
```

## Troubleshooting

### Build Fails: "requirements.txt not found"
- ✅ **Fixed**: Root `requirements.txt` is present
- ✅ **Scripts**: `build.sh` and `start.sh` handle directory navigation

### Database Connection Error
1. Verify DB credentials in Render environment variables
2. Check PostgreSQL is running on Render
3. Run migrations manually:
```bash
python back/manage.py migrate --settings=ecms.settings
```

### Static Files Not Found
- Ensure `python manage.py collectstatic` runs in build script
- Configure `STATIC_ROOT` in `settings.py`

### Port Issues
- Render automatically sets `PORT` environment variable
- Start script uses `${PORT:-8000}` (default to 8000 if PORT not set)

### Email Not Sending
1. Verify Gmail app password (not regular password)
2. Enable "Less Secure Apps" in Gmail settings
3. Check email variables in Render dashboard

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build timeout | Increase build timeout in Render settings |
| Out of memory | Upgrade to paid plan or optimize code |
| SSL certificate error | Render handles SSL automatically |
| Database locked | Clear old connections or restart service |
| Rate limiting 429 | Add rate limiting middleware or upgrade plan |

## Post-Deployment Checks

- [ ] ✅ Backend URL accessible
- [ ] ✅ Django admin `/admin` working
- [ ] ✅ API endpoints responding
- [ ] ✅ Database connected
- [ ] ✅ Email sending works
- [ ] ✅ Static files loading
- [ ] ✅ CORS configured correctly
- [ ] ✅ JWT tokens working

## Monitoring & Maintenance

### View Logs
1. Render Dashboard → Web Service → **Logs**
2. Check for errors and warnings

### Restart Service
1. Render Dashboard → Web Service → **Settings**
2. Click **"Restart"**

### Update Code
1. Push changes to `deploy_back` branch on GitHub
2. Render automatically re-deploys (if auto-deploy enabled)
3. Monitor logs during deployment

## Scaling for Production

### Free Plan (Current)
- Costs: $0/month
- Memory: 0.5GB
- CPU: Shared
- Limitations: Spins down after 15 min inactivity

### Paid Plans
- **Starter**: $7/month → 0.5GB dedicated
- **Standard**: $12/month → 1GB, better performance
- **Professional**: $29+/month → Multiple replicas

To upgrade:
1. Go to Service Settings
2. Select Plan tier
3. Click **"Change Plan"**

## Connected Services

- **PostgreSQL**: `ecms_db_pns4` on Render
- **Web Service**: `e-cms-backend` on Render
- **Frontend**: To be deployed to Vercel or Netlify

## Environment Configuration Files

**Development (.env):**
```
DB_HOST=localhost
DB_NAME=ecms_db
DEBUG=True
```

**Production (Render Dashboard):**
```
DB_HOST=dpg-d4p65gmuk2gs73d61fk0-a
DB_NAME=ecms_db_pns4
DEBUG=false
```

## API Documentation

Once deployed, access:
- **API Root**: `https://e-cms-backend.onrender.com/api/v1/`
- **Swagger UI**: `https://e-cms-backend.onrender.com/api/docs/` (if configured)
- **ReDoc**: `https://e-cms-backend.onrender.com/api/redoc/` (if configured)

## Git Deployment Branch

Current branch for Render: `deploy_back`

To deploy latest version:
```bash
# On your local machine
git push origin deploy_back
```

Render will automatically detect the push and re-deploy.

## Support & Resources

- Render Docs: https://render.com/docs
- Django Deployment: https://docs.djangoproject.com/en/4.2/howto/deployment/
- Gunicorn: https://gunicorn.org/
- PostgreSQL: https://www.postgresql.org/docs/

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Connect repository to Render
3. ✅ Configure environment variables
4. ✅ Deploy web service
5. ✅ Test endpoints
6. 🔄 Configure frontend to use new API URL
7. 🔄 Set up custom domain (optional)
8. 🔄 Configure SSL certificate (automatic)

---

**Status**: 🟢 Ready for Deployment  
**Last Updated**: December 5, 2025  
**Django Version**: 4.2.27  
**Python Version**: 3.13  
**Database**: PostgreSQL (Render)
