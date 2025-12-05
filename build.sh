#!/bin/bash
# Render build script for E-CMS

set -e

echo "🔨 Building E-CMS Backend..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
cd back
python manage.py migrate --settings=ecms.settings

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --settings=ecms.settings

echo "✅ Build completed successfully!"
