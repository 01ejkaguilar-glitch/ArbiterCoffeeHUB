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
- `vendor/`
- `artisan`
- `composer.json`
- `composer.lock`
- `index.php`

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
chmod -R 755 public_html/storage
chmod -R 755 public_html/bootstrap/cache
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
2. GitHub Actions automatically builds and deploys
3. Check Actions tab for deployment status

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
public_html/
├── app/              # Laravel app
├── bootstrap/        # Laravel bootstrap
├── build/            # React build (deployed by GitHub Actions)
├── config/           # Laravel config
├── database/         # Laravel database
├── public/           # Laravel public
├── resources/        # Laravel resources
├── routes/           # Laravel routes
├── storage/          # Laravel storage
├── vendor/           # Composer dependencies
├── .env              # Environment config
├── artisan           # Laravel CLI
└── index.php         # Entry point
```

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify FTP credentials in secrets
3. Ensure server is accessible

### Frontend Not Loading

1. Check `build/` folder exists in `public_html/`
2. Verify `.htaccess` is correct
3. Clear browser cache

### Backend Errors

1. Check `storage/logs/laravel.log`
2. Verify `.env` configuration
3. Run `php artisan config:clear`

## Notes

- `storage/` folder is NOT uploaded by GitHub Actions (excluded)
- `.env` file is NOT uploaded by GitHub Actions (excluded)
- `frontend/` folder is NOT uploaded (source only)
- First deployment requires manual upload of Laravel files
- Subsequent deployments are automatic via GitHub Actions
