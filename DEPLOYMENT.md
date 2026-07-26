# ArbiterCoffeeHUB Deployment Guide

This document outlines the complete deployment process for the ArbiterCoffeeHUB Laravel + React application on Hostinger shared hosting.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Initial Manual Setup](#phase-1-initial-manual-setup)
4. [Phase 2: Automated Deployment Pipeline](#phase-2-automated-deployment-pipeline)
5. [Phase 3: Ongoing Maintenance & Optimization](#phase-3-ongoing-maintenance--optimization)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedure](#rollback-procedure)

---

## Overview

The deployment strategy uses a **hybrid approach**:
- **Initial Setup**: One-time manual upload via FTP/SFTP to establish the baseline
- **Subsequent Updates**: Automated incremental deployments via GitHub Actions using `rsync over SSH`
- **Environment Protection**: Production `.env` file is excluded from automated deployments to prevent accidental overwrites
- **Performance**: Deployments reduced from 10-15 minutes to 10-30 seconds for typical changes

## Prerequisites

### Hostinger Account Requirements
- Active hosting plan with SSH access enabled
- Domain: `arbitercoffeeshop.com` (main) and `api.arbitercoffeeshop.com` (subdomain)
- MySQL database: `u576753664_ArbiterCoffee`
- Database user: `u576753664_ArbiterCoffee` with password `Aguilar#0121`
- PHP 8.3+ with required extensions (mbstring, intl, bcmath, xml, PDO, etc.)

### Local Development Requirements
- PHP 8.2+
- Composer 2.x
- Node.js 18+ (or use nvm)
- Git

### Repository Preparation
Ensure your GitHub repository has:
- `.github/workflows/deploy.yml` (created in this guide)
- Proper `.gitignore` (excluding `.env`, `vendor/`, `node_modules/`, etc.)
- Updated README with deployment instructions

---

## Phase 1: Initial Manual Setup

### Step 1: Prepare Local Build Artifacts

```bash
# 1. Install PHP dependencies (production optimized)
composer install --no-dev --prefer-dist --optimize-autoloader

# 2. Install Node.js dependencies and build React frontend
npm ci
cd frontend && npm ci && npm run build
cd ..
```

### Step 2: Upload Laravel Backend (via FTP/SFTP)

**Target Directory**: `/home/u576753664/domains/arbitercoffeeshop.com/public_html/api/`

Upload these files/folders:
```
app/
bootstrap/
config/
database/
public/
resources/
routes/
storage/
composer.json
composer.lock
artisan
server.php
```

**Important**: Do NOT upload:
- `.env` (will create manually)
- `vendor/` (will be installed via Composer on server if needed, but we'll keep it excluded)
- `.git/`
- `frontend/` (separate upload)

### Step 3: Upload React Frontend Build (via FTP/SFTP)

**Target Directory**: `/home/u576753664/domains/arbitercoffeeshop.com/public_html/`

Upload the **contents** of `frontend/build/` (not the folder itself):
```
index.html
static/
  css/
  js/
  media/
asset-manifest.json
favicon.ico
logo192.png
logo512.png
manifest.json
robots.txt
```

### Step 4: Create Production Environment File

**File**: `/home/u576753664/domains/arbitercoffeeshop.com/public_html/api/.env`

```env
APP_NAME=ArbiterCoffeeHub
APP_ENV=production
APP_KEY=[GENERATE_WITH: php artisan key:generate --show]
APP_DEBUG=false
APP_URL=https://api.arbitercoffeeshop.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u576753664_ArbiterCoffee
DB_USERNAME=u576753664_ArbiterCoffee
DB_PASSWORD=Aguilar#0121

SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.arbitercoffeeshop.com
SANCTUM_STATEFUL_DOMAINS=arbitercoffeeshop.com,api.arbitercoffeeshop.com

# CORS (if using Laravel cors config)
CORS_ALLOWED_ORIGINS=https://arbitercoffeeshop.com

# Mail (optional - configure if needed)
MAIL_MAILER=smtp
MAIL_HOST=[YOUR_SMTP_HOST]
MAIL_PORT=587
MAIL_USERNAME=[YOUR_EMAIL]
MAIL_PASSWORD=[YOUR_PASSWORD]
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@arbitercoffeeshop.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### Step 5: Post-Upload Configuration

Connect via SSH to your Hostinger server and run:

```bash
# Navigate to Laravel directory
cd /home/u576753664/domains/arbitercoffeeshop.com/public_html/api

# Set proper permissions
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs

# Generate application key (if not set above)
php artisan key:generate --show

# Cache configuration for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
php artisan optimize:clear
```

### Step 6: Verify Initial Deployment

Test these URLs:
- **Frontend**: https://arbitercoffeeshop.com (should load React app)
- **API Health Check**: https://api.arbitercoffeeshop.com/sanctum/csrf-cookie (should return 200)
- **API Route**: https://api.arbitercoffeeshop.com/api/v1/test (should return JSON response with API version info)

---

## Phase 2: Automated Deployment Pipeline

### Step 1: Create GitHub Secrets

Go to your repository: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `SSH_HOST` | Your Hostinger SSH host (e.g., `srvXXX.hostinger.com` or IP) | Found in hPanel → SSH Access |
| `SSH_PORT` | `65002` (default for Hostinger shared hosting) | Confirm in SSH Access details |
| `SSH_USERNAME` | Your FTP/SSH username (e.g., `u576753664`) | Same as your cPanel/FTP username |
| `SSH_PRIVATE_KEY` | Contents of your private SSH key (`~/.ssh/id_rsa`) | **Never share this**; generate a dedicated key for deployment |
| `SLACK_WEBHOOK_URL` | *(Optional)* Slack Incoming Webhook URL for notifications | Create in Slack Apps → Incoming Webhooks |

#### Generating SSH Key Pair (if needed):
```bash
# Generate new SSH key pair (no passphrase for automation)
ssh-keygen -t ed25519 -f ~/.deploy_key -N ""

# Public key (add to Hostinger):
cat ~/.deploy_key.pub

# Private key (add as SSH_PRIVATE_KEY secret):
cat ~/.deploy_key
```

#### Adding Public Key to Hostinger:
1. Go to hPanel → SSH Access
2. Click "Manage SSH keys"
3. Import your public key (`~/.deploy_key.pub`)
4. Authorize the key

### Step 2: Verify Workflow File
Ensure `.github/workflows/deploy.yml` exists with the content created earlier. Key features:
- **Triggers**: Push to `main` branch
- **Jobs**: 
  1. Setup PHP & Node.js
  2. Install dependencies (Composer + NPM)
  3. Build React production bundle
  4. Deploy via rsync (incremental)
  5. Run post-deployment Laravel optimization commands
  6. Optional Slack notification

### Step 3: Test the Pipeline
1. Make a small, harmless change (e.g., update README.md)
2. Commit and push to `main`:
   ```bash
   git add README.md
   git commit -m "test: verify deployment pipeline"
   git push origin main
   ```
3. Go to **Actions** tab in your GitHub repository
4. Watch the workflow run:
   - Should complete in 1-3 minutes (first run includes dependency installation)
   - Subsequent runs with only code changes: 30-90 seconds
5. Verify deployment by checking your site and API

### Step 4: Monitor Deployment Efficiency
After a few deployments, check:
- **GitHub Actions logs**: Look for `rsync` output showing transferred file count
- **Typical output**:
  ```
  sent 1,234 bytes  received 56 bytes  2,580.00 bytes/sec
  total size is 12,345,678  speedup is 4,567.89
  ```
- Small changes should transfer **only dozens to hundreds of files**, not the entire project

---

## Phase 3: Ongoing Maintenance & Optimization

### Regular Maintenance Tasks

#### Monthly:
1. **Update Dependencies**:
   ```bash
   composer update --lock
   npm update
   ```
   (Test locally, then push to trigger deployment)

2. **Clear Optimized Caches** (if needed):
   ```bash
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

#### Quarterly:
1. **Review Laravel Logs**: Check for recurring errors
   ```bash
   tail -n 100 storage/logs/laravel.log
   ```

2. **Database Optimization**:
   ```bash
   php artisan optimize
   ```

3. **Check Disk Usage**:
   ```bash
   du -sh storage/
   ```

### Performance Monitoring

#### Health Check Endpoint (Optional)
Add to `routes/api.php`:
```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'environment' => app()->environment(),
        'database' => DB::connection()->getPing(),
    ]);
});
```
Access: `https://api.arbitercoffeeshop.com/api/v1/health`

#### External Monitoring Considerations
- **UptimeRobot** (free for basic HTTP monitoring)
- **Healthchecks.io** (for cron jobs and health pings)
- **Google Analytics / SimilarWeb** (for frontend traffic)

---

## Troubleshooting

### Common Issues & Solutions

#### 1. "Permission Denied" on Storage/Cache
**Symptoms**: `The stream or file "/path/to/storage/logs/laravel.log" could not be opened: failed to open stream: Permission denied`
**Solution**:
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache  # If applicable
```

#### 2. Database Connection Failed
**Symptoms**: `SQLSTATE[HY000] [2002] Connection refused`
**Checks**:
- Verify `.env` DB credentials match Hostinger MySQL setup
- Ensure database user has `localhost` access (shared hosting restriction)
- Test connection: `php artisan tinker --execute="DB::connection()->getPdo();"`

#### 3. CORS Errors (Frontend cannot reach API)
**Symptoms**: Browser console shows `Access to XMLHttpRequest at 'https://api.arbitercoffeeshop.com/api/...' from origin 'https://arbitercoffeeshop.com' has been blocked by CORS policy`
**Solutions**:
- Verify `SESSION_DOMAIN=.arbitercoffeeshop.com` (note leading dot)
- Verify `SANCTUM_STATEFUL_DOMAINS=arbitercoffeeshop.com,api.arbitercoffeeshop.com`
- Check `config/cors.php`:
  ```php
  'paths' => ['api/*', 'sanctum/csrf-cookie'],
  'allowed_origins' => ['https://arbitercoffeeshop.com'],
  'allowed_headers' => ['*'],
  'exposed_headers' => [],
  'max_age' => 0,
  'supports_credentials' => true,
  ```

#### 4. Deployment Fails During Rsync Step
**Symptoms**: GitHub Action fails with `ssh: connect to host [...] port 65002: Connection refused`
**Checks**:
- Verify SSH credentials in repository secrets
- Ensure SSH access is enabled in Hostinger hPanel
- Confirm public key is authorized in SSH Access section
- Test connection manually: `ssh -p 65002 u576753664@your-hostinger-server.com`

#### 5. "500 Internal Server Error" After Deployment
**Steps**:
1. Check Laravel logs: `ssh into server -> tail -f storage/logs/laravel.log`
2. Enable debug temporarily in `.env`: `APP_DEBUG=true` (remember to revert!)
3. Common causes:
   - Missing `.env` variables
   - Composer autoload issues (run `composer dump-autoload`)
   - Permission issues on storage/bootstrap/cache

#### 6. React App Shows Blank Page
**Checks**:
- Verify `.htaccess` in public_html contains React Router fallback:
  ```
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>
  ```
- Check browser console for JavaScript errors
- Ensure MIME types are correct for CSS/JS files

---

## Rollback Procedure

### Emergency Rollback (Immediate Issue)
If a deployment breaks the site critically:

1. **Via GitHub**:
   - Revert the problematic commit: `git revert <bad-commit-hash>`
   - Push to `main`: `git push origin main`
   - This triggers an automatic redeployment of the previous known-good state

2. **Manual Rollback** (if GitHub Actions unavailable):
   - SSH into server
   - Navigate to Laravel directory: `cd /home/u576753664/domains/arbitercoffeeshop.com/public_html/api`
   - Restore from backup (if you maintain regular backups via hPanel)
   - Or manually redeploy previous known-good version via FTP

### Planned Rollback (Versioned Deploys)
For more advanced versioning:
1. Tag releases locally: `git tag -a v1.2.1 -m "Release 1.2.1"`
2. Push tags: `git push origin --tags`
3. To rollback: Checkout tag and force-push (use with caution):
   ```bash
   git fetch --all
   git reset --hard v1.2.0
   git push -f origin main
   ```

---

## Best Practices Summary

### ✅ Do's
- Always test changes locally before pushing to `main`
- Use meaningful commit messages
- Monitor GitHub Actions for failed workflows
- Keep a backup of your `.env` file in a secure password manager
- Schedule regular dependency updates
- Document any server-specific configurations

### ❌ Don'ts
- Never commit `.env` to the repository
- Avoid making direct changes on the server (they'll be overwritten)
- Don't run `composer update` on production without local testing
- Never set `APP_DEBUG=true` in production for extended periods
- Avoid large file uploads via Git (use storage system or external CDN)

---

## Support & Contacts

For issues beyond standard deployment:
- **Hostinger Support**: Available 24/7 via live chat/ticket in hPanel
- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://reactjs.org/docs/getting-started.html
- **GitHub Actions Docs**: https://docs.github.com/en/actions

**Last Updated**: July 2026  
**Maintained by**: ArbiterCoffeeHUB Development Team

---
*This document should be version-controlled and updated whenever the deployment process changes.*