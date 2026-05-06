# Deployment Guide - ArbiterCoffeeShopHUB

## Project Structure

```
ArbiterCoffeeShopHUB/
├── app/              # Laravel app
├── bootstrap/        # Laravel bootstrap
├── build/            # React build (generated, not in git)
├── config/           # Laravel config
├── database/         # Laravel database
├── docs/             # Documentation
├── frontend/         # React source (not deployed)
├── public/           # Laravel public files
├── resources/        # Laravel resources
├── routes/           # Laravel routes
├── scripts/          # Utility scripts
├── storage/          # Laravel storage
├── tests/            # Laravel tests
├── vendor/           # Composer dependencies
├── .env              # Environment config
├── .github/          # GitHub Actions
├── .vscode/          # VS Code config
├── artisan           # Laravel CLI
├── composer.json     # Composer config
└── index.php         # Entry point
```

## GitHub Actions Setup

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `FTP_HOST` | your Hostinger FTP host |
| `FTP_USERNAME` | your Hostinger FTP username |
| `FTP_PASSWORD` | your Hostinger FTP password |

### 2. Initial Server Setup

Upload these folders manually to `public_html/` via FTP:

- `app/`
- `bootstrap/`
- `config/`
- `database/`
- `public/`
- `resources/`
- `routes/`
- `storage/`
- `tests/`
- `vendor/`
- `artisan`
- `composer.json`
- `composer.lock`
- `index.php`

Then create `.env` file in `public_html/` with production values from `.env.production`

### 3. Create .env on Server

Create `.env` file in `public_html/`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://arbitercoffee.shop

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=arbitercoffee.shop
REVERB_PORT=443
REVERB_SCHEME=https
```

### 4. Set Permissions

```bash
cd public_html
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### 5. Run Migrations

```bash
cd public_html
php artisan migrate --force
php artisan key:generate
```

## Deployment Workflow

### Automatic Deployment (GitHub Actions)

1. Push changes to `main` branch
2. GitHub Actions automatically:
   - Builds the frontend
   - Installs composer dependencies locally
   - Uploads files to your Hostinger server via FTP
   - Excludes vendor directory (too large for FTP)
3. Check Actions tab for deployment status

**IMPORTANT: Manual Step Required After Deployment**

Since the vendor directory is too large for FTP upload, you need to manually install composer dependencies after each deployment.

**EASIEST METHOD - Use the PHP Script:**

1. After deployment completes, access: `https://yourdomain.com/install_composer.php`
2. Wait for the installation to complete (shows progress)
3. **DELETE the `install_composer.php` file from your server!**

The script will automatically:
- Check if composer is available
- Install all composer dependencies
- Clear all Laravel caches
- Show you the progress and results

**Alternative Methods:**

**Via Hostinger Control Panel:**
1. Log in to your Hostinger control panel
2. Go to **File Manager**
3. Navigate to your domain folder
4. Look for a **Terminal** or **Console** option
5. Run these commands:
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

**Via Hostinger's PHP Composer Tool:**
1. Look for **"PHP Composer"** or **"Composer"** tool in control panel
2. Navigate to your domain folder
3. Run `composer install --no-dev --optimize-autoloader`

### Manual Deployment (VS Code SFTP)

1. Install "SFTP" extension in VS Code
2. Edit files - they auto-upload on save
3. For frontend changes: Run `npm run build` in `frontend/` folder

### Building Frontend Locally

```bash
cd frontend
npm run build
```

The build output will be in the root `build/` folder.

### Post-Deployment Commands

After deployment, run these via SSH:

```bash
cd public_html

# Clear cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (if needed)
php artisan migrate --force
```

## Server Structure

```
public_html/ (FTP home directory: /home/u843463747/public_html)
├── build/            # React build (deployed by GitHub Actions)
│   ├── assets/       # Static assets
│   │   ├── css/
│   │   └── js/
│   ├── index.html    # React entry point
│   ├── favicon.ico
│   └── robots.txt
├── app/              # Laravel application
├── bootstrap/        # Laravel bootstrap
├── config/           # Laravel configuration
├── database/         # Laravel database
├── public/           # Laravel public files
│   ├── index.php     # Laravel entry point
│   ├── .htaccess     # Apache configuration
│   ├── favicon.ico
│   └── robots.txt
├── resources/        # Laravel resources
├── routes/           # Laravel routes
├── storage/          # Laravel storage
├── tests/            # Laravel tests
├── vendor/           # Composer dependencies
├── .env              # Environment config
├── artisan           # Laravel CLI
├── composer.json     # Composer config
├── composer.lock     # Composer lock file
├── index.php         # Laravel entry point
└── install_composer.php  # Installation helper script
```

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify FTP credentials in secrets
3. Ensure server is accessible
4. Check that FTP connection is stable

### Frontend Not Loading

1. Check `build/` folder exists in `public_html/`
2. Verify `.htaccess` is correct in `public_html/`
3. Clear browser cache
4. Check that React build files are present

### Backend Errors

1. Check `storage/logs/laravel.log` for error details
2. Verify `.env` configuration in `public_html/`
3. Run `php artisan config:clear`
4. Check file permissions on `storage/` and `bootstrap/cache/`

### Directory Structure Issues

**Problem**: Files are in wrong location
**Solution**: Ensure files are in correct directories:
- All Laravel files: `public_html/`
- Laravel public files: `public_html/public/`
- React build files: `public_html/build/`

**Problem**: index.php can't find vendor/autoload.php
**Solution**: Check that vendor directory exists in `public_html/vendor/`

### Vendor Directory Missing (Fatal Error: require autoload.php)

This is expected behavior with FTP deployment. The vendor directory is too large for FTP upload and must be installed manually.

**EASIEST SOLUTION - Use the PHP Script:**

1. Access: `https://yourdomain.com/install_composer.php`
2. Wait for installation to complete
3. **DELETE the `install_composer.php` file from your server!**

**Alternative Solutions:**

**Option 1: Using Terminal/Console (if available)**
1. Log in to your Hostinger control panel
2. Go to **File Manager**
3. Navigate to `public_html/`
4. Look for **Terminal** or **Console** option
5. Run:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

**Option 2: Using Hostinger's PHP Composer Tool**
1. Log in to your Hostinger control panel
2. Look for **"PHP Composer"** or **"Composer"** tool
3. Navigate to `public_html/`
4. Run `composer install --no-dev --optimize-autoloader`

## Notes

- `storage/` folder is NOT uploaded by GitHub Actions (excluded)
- `.env` file is NOT uploaded by GitHub Actions (excluded)
- `vendor/` folder is NOT uploaded by GitHub Actions (too large for FTP - must be installed manually)
- `frontend/` folder is NOT uploaded (source only)
- First deployment requires manual upload of Laravel files to `public_html/`
- Subsequent deployments are automatic via GitHub Actions
- **Manual composer installation required after each deployment**
- **Use the `install_composer.php` script for easiest installation**
- **DELETE the `install_composer.php` file after installation!**
- FTP deployment is used because SSH is not available
- The PHP script method is the easiest way to install composer dependencies without SSH
- All files are deployed to `public_html/` (Hostinger's FTP home directory)
