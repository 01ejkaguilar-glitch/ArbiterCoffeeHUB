# Hostinger Shared Hosting Restructuring Design

## Overview

Restructure the ArbiterCoffeeHUB project to be fully compatible with Hostinger shared hosting using:
- Main domain **arbitercoffee.shop** → React frontend (served from `/public_html/`)
- API subdomain **api.arbitercoffee.shop** → Laravel backend (served from `/public_html/api/`)

## Current State

### File Structure
```
/ (root - mono-repo with mixed Laravel + React)
├── frontend/          → React source
├── build/             → React build output
├── app/, config/, routes/...  → Laravel (root level)
└── public/            → Laravel public
```

### Deployment Issue
- GitHub Actions workflow completes but `public_html` on server is empty
- SFTP upload silently fails but exits successfully
- Diagnostic logging added to identify exact failure point

## Target Architecture

### Server File Structure (Hostinger)
```
/
└── public_html/                              ← arbitercoffee.shop document root
    ├── index.html                            ← React frontend
    ├── static/                               ← React assets (JS, CSS, images)
    ├── favicon.ico
    ├── manifest.json
    └── api/                                  ← api.arbitercoffee.shop document root
        ├── index.php                         ← Laravel entry point
        ├── artisan
        ├── composer.json
        ├── composer.lock
        ├── .env
        ├── app/                              ← Laravel application
        ├── bootstrap/
        ├── config/
        ├── routes/
        ├── storage/                          ← Logs, cache, sessions
        │   └── framework/
        │       ├── cache/
        │       ├── sessions/
        │       └── views/
        ├── database/
        ├── resources/
        ├── lang/
        ├── vendor/                           ← Installed by deploy.sh
        ├── bootstrap/cache/
        └── public/.htaccess
```

### Network Architecture
```
User Browser
    │
    ├─→ https://arbitercoffee.shop/         → React SPA (static files)
    │       │
    │       └─→ fetch('https://api.arbitercoffee.shop/api/v1/...')
    │
    └─→ https://api.arbitercoffee.shop/api/v1/...
            │
            └─→ Laravel API (shared hosting /public_html/api/)
```

## Implementation Plan

### 1. GitHub Actions Workflow (.github/workflows/deploy.yml)

**Keep current structure but verify paths:**
- Build React → outputs to `build/` (root)
- Create `public_html/` directory structure
- Copy `build/*` → `public_html/` (frontend)
- Copy Laravel core → `public_html/api/` (backend)
- Upload `public_html/*` → SFTP root `/public_html/`

**Key environment variables set in workflow:**
- `NODE_ENV=production`
- `REACT_APP_API_URL=https://api.arbitercoffee.shop/api/v1`

### 2. Laravel Configuration Changes

#### 2.1 .env updates
```diff
- APP_URL=https://arbitercoffee.shop
+ APP_URL=https://api.arbitercoffee.shop

  SESSION_DOMAIN=arbitercoffee.shop

+ SANCTUM_STATEFUL_DOMAINS=arbitercoffee.shop

  CORS_ALLOWED_ORIGINS=https://arbitercoffee.shop
```

#### 2.2 config/cors.php (already correct, verify)
- `allowed_origins` reads from `CORS_ALLOWED_ORIGINS` env
- Already set to `https://arbitercoffee.shop` in .env

#### 2.3 config/sanctum.php
- Add api.arbitercoffee.shop to stateful domains

### 3. Server-side Deploy Script (deploy.sh)

Current script at `/var/www/arbiter/api` (on server) needs to:
1. Run `composer install --no-dev --optimize-autoloader`
2. Run `php artisan config:cache`
3. Run `php artisan route:cache`
4. Fix permissions on `storage/` and `bootstrap/cache/`

### 4. Hostinger hPanel Configuration (User Action Required)

| Setting | Value |
|---------|-------|
| Main domain document root | `/public_html/` |
| Subdomain | `api.arbitercoffee.shop` |
| Subdomain document root | `/public_html/api/` |

## Files to Modify

| File | Change Type |
|------|-------------|
| `.env` | Modify - APP_URL, add SANCTUM_STATEFUL_DOMAINS |
| `config/sanctum.php` | Modify - add stateful domains |
| `.github/workflows/deploy.yml` | Modify - verify upload paths |
| `deploy.sh` | No change needed |

## Testing Plan

1. **Local test:** Run workflow with diagnostic output
2. **Verify remote:**
   - Check `/public_html/` contains React files
   - Check `/public_html/api/` contains Laravel files
3. **Functional test:**
   - Visit `https://arbitercoffee.shop` - should show React app
   - Visit `https://api.arbitercoffee.shop/api/v1/products` - should return JSON

## Rollback Plan

If deployment fails:
1. Keep previous working state on server (if any)
2. Revert workflow changes
3. Manually restore via File Manager if needed

## Dependencies

- Hostinger SSH/SFTP access (for initial setup)
- SSL certificates (auto-provisioned by Hostinger)
- MySQL database (already configured)
