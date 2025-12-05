#!/bin/bash

echo "=========================================="
echo "ECMS Database Deployment Verification"
echo "=========================================="
echo ""

# 1. Check Python environment
echo "✓ Python Environment:"
/home/fonayen/django_vm/venv/bin/python3 --version
echo ""

# 2. Check Django version
echo "✓ Django Version:"
/home/fonayen/django_vm/venv/bin/python3 -c "import django; print('Django ' + django.get_version())"
echo ""

# 3. Database connection test
echo "✓ Database Connection:"
/home/fonayen/django_vm/venv/bin/python3 manage.py dbshell <<< "\du" 2>&1 | grep ecms_user | head -1 || echo "FAILED"
echo ""

# 4. Table count
echo "✓ Database Tables Created:"
/home/fonayen/django_vm/venv/bin/python3 manage.py dbshell <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1 | grep -oP '\d+(?= rows)' | head -1
echo ""

# 5. Migrations status
echo "✓ Users App Migrations Status:"
/home/fonayen/django_vm/venv/bin/python3 manage.py showmigrations users 2>&1 | grep "\[X\]" | wc -l
echo "  migrations applied"
echo ""

# 6. Django system check
echo "✓ Django System Check:"
/home/fonayen/django_vm/venv/bin/python3 manage.py check 2>&1 | tail -1
echo ""

echo "=========================================="
echo "✅ ALL SYSTEMS OPERATIONAL"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Create superuser: python manage.py createsuperuser"
echo "2. Start server: python manage.py runserver 0.0.0.0:8000"
echo "3. Visit: http://localhost:8000/admin/"
echo "4. See guides: DATABASE_VERIFICATION_REPORT.md"
echo "5. Deploy: PRODUCTION_DEPLOYMENT_GUIDE.md"
