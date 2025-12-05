#!/bin/bash
# Render start script for E-CMS

set -e

cd back

echo "🚀 Starting E-CMS Backend..."

# Start Gunicorn
gunicorn ecms.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 3 \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
