# Hostinger Restructuring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure App/Env to point to correct API subdomain (api.arbitercoffee.shop) and enable CORS/Sanctum for cross-domain auth from React frontend

**Architecture:** Update Laravel configuration to serve API at api.arbitercoffee.shop while React serves from arbitercoffee.shop. Uses CORS for cross-origin requests and Sanctum for SPA authentication with cookies shared across subdomains.

**Tech Stack:** Laravel 11, Sanctum, CORS, React 19

---

## Pre-Implementation Check

- [ ] Verify diagnostic workflow run results (from earlier) to confirm SFTP paths

---

### Task 1: Update .env for API Subdomain

**Files:**
- Modify: `.env:5`
- Modify: `.env` (add line after SESSION_DOMAIN)

- [ ] **Step 1: Update APP_URL**

Change:
```
APP_URL=https://arbitercoffee.shop
```

To:
```
APP_URL=https://api.arbitercoffee.shop
```

- [ ] **Step 2: Add SANCTUM_STATEFUL_DOMAINS**

Add after line 31 (SESSION_DOMAIN):
```
SANCTUM_STATEFUL_DOMAINS=arbitercoffee.shop
```

- [ ] **Step 3: Commit**

```bash
git add .env
git commit -m "config: update APP_URL for API subdomain and add SANCTUM_STATEFUL_DOMAINS

- APP_URL set to api.arbitercoffee.shop (Laravel serves from this domain)
- SANCTUM_STATEFUL_DOMAINS allows SPA auth from arbitercoffee.shop
- CORS_ALLOWED_ORIGINS already configured for frontend domain

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Configure Sanctum Stateful Domains

**Files:**
- Modify: `config/sanctum.php`

- [ ] **Step 1: Read current sanctum.php**

```bash
cat config/sanctum.php
```

- [ ] **Step 2: Update stateful domains**

Find the `stateful` array and update to include both domains:

```php
'stateful' => explode(',', implode(',', array_filter([
    centralDomain(env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'arbitercoffee.shop,api.arbitercoffee.shop',
        env('APP_ENV') === 'local' ? ',localhost,127.0.0.1,127.0.0.1:3000,localhost:3000' : ''
    ))),
    'localhost',
    '127.0.0.1',
    '127.0.0.1:3000',
    'localhost:3000',
]))),
```

- [ ] **Step 3: Verify Sanctum config is complete**

Ensure these settings exist:
- `expiration` = 120 (minutes)
- `token_prefix` = ''
- `middleware` = 'auth:sanctum'

- [ ] **Step 4: Commit**

```bash
git add config/sanctum.php
git commit -m "config: add stateful domains for Sanctum SPA authentication

- Include both arbitercoffee.shop and api.arbitercoffee.shop
- Allow localhost for development

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Verify CORS Configuration

**Files:**
- Verify: `config/cors.php`
- Verify: `.env` line 73

- [ ] **Step 1: Check CORS config**

```bash
grep -n "CORS_ALLOWED_ORIGINS" .env config/cors.php
```

- [ ] **Step 2: Confirm CORS_ALLOWED_ORIGINS in .env**

Should already exist and equal `https://arbitercoffee.shop`

- [ ] **Step 3: Verify cors.php reads from env**

Check line 20 in config/cors.php:
```php
'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', ...)),
```

If correct, this task is complete. No changes needed.

---

### Task 4: Trigger and Monitor Deployment

**Files:**
- Trigger: GitHub Actions workflow

- [ ] **Step 1: Push all changes**

```bash
git push origin main
```

This will trigger the workflow automatically.

- [ ] **Step 2: Wait for workflow to complete**

Check GitHub Actions tab for:
- Pre-upload file count
- Remote directory listing (before)
- Remote directory listing (after)

- [ ] **Step 3: Verify deployment success**

If workflow fails: review diagnostic output to identify issue
If workflow succeeds: proceed to Task 5

---

### Task 5: Test Production Deployment

**Files:**
- None (external verification)

- [ ] **Step 1: Test React frontend**

Visit: `https://arbitercoffee.shop`
- Should load React app without errors
- Network tab should show successful API calls to api.arbitercoffee.shop

- [ ] **Step 2: Test API endpoint**

Visit: `https://api.arbitercoffee.shop/api/v1/products`
- Should return JSON (may need auth, but should not be 404/500)
- Check CORS headers are present

- [ ] **Step 3: Test authentication (if applicable)**

Log in through React app and verify:
- Cookies are set correctly
- API calls include proper CSRF/session tokens

---

## Plan Summary

| Task | Description | Changes |
|------|-------------|---------|
| 1 | Update .env | APP_URL, SANCTUM_STATEFUL_DOMAINS |
| 2 | Configure Sanctum | Add stateful domains |
| 3 | Verify CORS | Ensure config is correct |
| 4 | Deploy | Trigger workflow |
| 5 | Test | Verify production works |

## Expected Outcome

After implementation:
- `https://arbitercoffee.shop` serves React frontend
- `https://api.arbitercoffee.shop` serves Laravel API
- CORS allows frontend to call API
- Sanctum authentication works across domains
