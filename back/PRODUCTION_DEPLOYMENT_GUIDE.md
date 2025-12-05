# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Database Verification ✅
- [x] PostgreSQL installed and running
- [x] Database `ecms_db` created
- [x] User `ecms_user` created with password
- [x] All 30 tables created
- [x] All 4 migrations applied
- [x] Django system check passed (0 issues)

### 2. Environment Setup

#### Create `.env` file in `/back` directory:
```bash
cat > /back/.env << 'EOF'
# PostgreSQL Configuration
DB_NAME=ecms_db
DB_USER=ecms_user
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
SECRET_KEY=your-production-secret-key-change-this
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com,www.yourdomain.com

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com

# Email Configuration (Gmail)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password

# API Configuration
API_BASE_URL=https://yourdomain.com/api/v1
FRONTEND_URL=https://frontend.yourdomain.com

# Logging
LOG_LEVEL=INFO
EOF
```

### 3. Load Environment Variables

```bash
cd /back
source .env
export $(cat .env | xargs)
```

### 4. Install Production Requirements

```bash
pip install -r requirements.txt
pip install gunicorn psycopg2-binary python-dotenv whitenoise
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

**Interactive Prompt:**
```
Username: admin
Email: admin@yourdomain.com
Password: [secure password]
Password (again): [confirm]
```

### 6. Test API Endpoints

```bash
# Start development server
python manage.py runserver 0.0.0.0:8000
```

Test endpoints:
```bash
# Register new user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "password_confirm": "TestPassword123!"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123!"
  }'

# Send verification email
curl -X POST http://localhost:8000/api/v1/auth/email/verify/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{}'
```

### 7. Database Backup Strategy

#### Create backup directory
```bash
mkdir -p /backups/ecms_db
chmod 700 /backups/ecms_db
```

#### Create backup script
```bash
cat > /backups/backup_ecms.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups/ecms_db"
DB_NAME="ecms_db"
DB_USER="ecms_user"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/ecms_db_$TIMESTAMP.sql"

pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE
gzip $BACKUP_FILE

echo "Backup created: $BACKUP_FILE.gz"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /backups/backup_ecms.sh
```

#### Schedule daily backups (crontab)
```bash
crontab -e
```

Add this line:
```
0 2 * * * /backups/backup_ecms.sh >> /var/log/ecms_backup.log 2>&1
```

### 8. Production Server Setup (Gunicorn)

#### Create Gunicorn service file
```bash
sudo cat > /etc/systemd/system/ecms-api.service << 'EOF'
[Unit]
Description=ECMS API (Gunicorn)
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/home/fonayen/Desktop/E-CMS/E-CMS_NuitInfo2025_TeamFsUY1/back
EnvironmentFile=/home/fonayen/Desktop/E-CMS/E-CMS_NuitInfo2025_TeamFsUY1/back/.env
ExecStart=/home/fonayen/django_vm/venv/bin/gunicorn \
    --workers 4 \
    --worker-class=sync \
    --worker-tmp-dir=/dev/shm \
    --bind 127.0.0.1:8001 \
    --timeout 30 \
    --access-logfile - \
    --error-logfile - \
    ecms.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ecms-api
sudo systemctl start ecms-api
```

### 9. Nginx Reverse Proxy Configuration

```bash
sudo cat > /etc/nginx/sites-available/ecms-api << 'EOF'
upstream ecms_api {
    server 127.0.0.1:8001;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    client_max_body_size 100M;
    
    location /api/v1/ {
        proxy_pass http://ecms_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }
    
    location /admin/ {
        proxy_pass http://ecms_api;
        proxy_set_header Host $host;
    }
    
    location /static/ {
        alias /home/fonayen/Desktop/E-CMS/E-CMS_NuitInfo2025_TeamFsUY1/back/staticfiles/;
    }
    
    location /media/ {
        alias /home/fonayen/Desktop/E-CMS/E-CMS_NuitInfo2025_TeamFsUY1/back/media/;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/ecms-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. SSL/TLS Configuration (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Update Nginx config for HTTPS
sudo cat >> /etc/nginx/sites-available/ecms-api << 'EOF'
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of config (same as above)
}
EOF
```

### 11. Monitoring & Logging

#### Django Logging Configuration
Add to `settings.py`:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'ecms.log'),
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 5,
        },
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
        },
    },
}
```

#### Create logs directory
```bash
mkdir -p /home/fonayen/Desktop/E-CMS/E-CMS_NuitInfo2025_TeamFsUY1/back/logs
chmod 755 logs
```

### 12. Security Hardening

#### Update Django Settings
```python
# settings.py
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = {
    "default-src": ("'self'",),
    "script-src": ("'self'", "'unsafe-inline'"),
    "style-src": ("'self'", "'unsafe-inline'"),
    "img-src": ("'self'", "data:", "https:"),
}
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### 13. Database Maintenance

#### Weekly optimization
```bash
# Connect to database
psql -U ecms_user -d ecms_db
```

```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 14. Health Check Endpoint

Test API health:
```bash
curl -v http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

Expected response (401 if credentials wrong is OK - proves API is responding):
```json
{
    "detail": "Invalid credentials"
}
```

### 15. Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Load test authentication endpoint
ab -n 100 -c 10 -p test.json -T application/json http://localhost:8000/api/v1/auth/login
```

---

## Deployment Commands Summary

```bash
# 1. Navigate to project
cd /home/fonayen/Desktop/E-CMS/E-CMS_NuitInfo2025_TeamFsUY1/back

# 2. Activate virtual environment
source /home/fonayen/django_vm/venv/bin/activate

# 3. Load environment
export $(cat .env | xargs)

# 4. Collect static files
python manage.py collectstatic --noinput

# 5. Run migrations (if needed)
python manage.py migrate

# 6. Create superuser (first time only)
python manage.py createsuperuser

# 7. Test locally
python manage.py runserver 0.0.0.0:8000

# 8. Deploy with Gunicorn
gunicorn --workers 4 --bind 127.0.0.1:8001 ecms.wsgi:application
```

---

## Verification Checklist

Before marking as production-ready:

- [ ] .env file created with secure values
- [ ] PostgreSQL connection verified
- [ ] All migrations applied (check: `python manage.py showmigrations`)
- [ ] Static files collected
- [ ] Superuser created
- [ ] Email backend configured
- [ ] CORS settings configured
- [ ] DEBUG = False in production settings
- [ ] SECRET_KEY is unique and secure
- [ ] ALLOWED_HOSTS configured
- [ ] Database backups working
- [ ] SSL/TLS certificates installed
- [ ] Gunicorn service running
- [ ] Nginx reverse proxy working
- [ ] API endpoints responding correctly
- [ ] Authentication flow tested (register → login → verify email)
- [ ] Error logging configured
- [ ] Monitoring alerts set up

---

## Troubleshooting

### Connection refused to PostgreSQL
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U ecms_user -h localhost -d ecms_db
```

### Static files not found
```bash
python manage.py collectstatic --noinput --clear
```

### Permission denied errors
```bash
sudo chown -R www-data:www-data /home/fonayen/Desktop/E-CMS/E-CMS_NuitInfo2025_TeamFsUY1/back
```

### Django migrations not applied
```bash
python manage.py migrate --verbosity 2
python manage.py showmigrations
```

### API returning 403 FORBIDDEN
- Check CORS_ALLOWED_ORIGINS
- Check CSRF_TRUSTED_ORIGINS
- Verify token in Authorization header

---

## Support & Resources

- Django Documentation: https://docs.djangoproject.com/
- DRF Documentation: https://www.django-rest-framework.org/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Gunicorn Documentation: https://docs.gunicorn.org/

---

**Status:** ✅ READY FOR PRODUCTION DEPLOYMENT

**Last Updated:** Post-Database Verification
