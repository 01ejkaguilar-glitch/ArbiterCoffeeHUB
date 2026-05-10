#!/bin/bash
set -euo pipefail

# Fast deployment script for Hostinger
# Skips composer install if vendor already exists (pre-built in CI)

START_TIME=$(date +%s)

echo "🚀 Starting post-deploy..."

cd /var/www/arbiter/api

# Fast path: vendor exists (CI pre-built)
if [ -d "vendor" ] && [ -f "vendor/autoload.php" ]; then
    echo "✅ Vendor already pre-built, skipping install"
else
    echo "📦 Installing vendor (first deploy or missing)..."
    composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction
fi

# Optimized cache clear (only what's needed)
echo "🧹 Clearing cache..."
php artisan config:cache 2>/dev/null || php artisan config:clear
php artisan route:cache 2>/dev/null || php artisan route:clear

# Fast permission fix
echo "🔐 Fixing permissions..."
find storage bootstrap/cache -type d -exec chmod 775 {} \; 2>/dev/null || true
find storage bootstrap/cache -type f -exec chmod 664 {} \; 2>/dev/null || true

# Quick sanity check
php artisan --version > /dev/null 2>&1 && echo "✅ Laravel OK" || echo "❌ Laravel broken"

echo "✅ Deploy complete in $(($(date +%s) - $START_TIME))s"
