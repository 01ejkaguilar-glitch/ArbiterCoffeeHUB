#!/bin/bash

# Deployment script for Hostinger
# This script handles the vendor directory installation

echo "Starting deployment script..."

# Check if composer is available
if ! command -v composer &> /dev/null; then
    echo "Composer is not installed. Installing composer..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
fi

# Install composer dependencies
echo "Installing composer dependencies..."
composer install --no-dev --optimize-autoloader

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# Clear Laravel cache
echo "Clearing Laravel cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Deployment completed successfully!"