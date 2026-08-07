# Arbiter Coffee Hub - Deployment Summary

## Overview
This document summarizes the deployment process for the Arbiter Coffee Hub Laravel + React application to Hostinger hosting.

## Deployment Workflow
The application is deployed using GitHub Actions with the workflow defined in `.github/workflows/deploy.yml`.

### Workflow Steps

1. **Checkout Code**
   - Retrieves the latest code from the repository

2. **Setup PHP**
   - Installs PHP 8.2 with required extensions (mbstring, intl, bcmath, xml)

3. **Install Composer Dependencies**
   - Installs Laravel dependencies using Composer

4. **Sanitize SSH Variables**
   - Uses delimiter syntax to safely handle SSH-related secrets (USERNAME, HOST, PORT, PRIVATE_KEY)
   - Trims leading/trailing whitespace from private key while preserving internal key structure
   - Sets them as environment variables for use in subsequent steps

5. **Build React Frontend**
   - Ensures package-lock.json exists (generates if missing)
   - Installs frontend dependencies with --legacy-peer-deps to handle version conflicts
   - Builds the React application for production

6. **Validate Environment**
   - Checks that .env file exists and is not empty
   - Warns if APP_KEY is not set (will be generated during deployment)

7. **Set Up SSH Connection**
   - Creates ~/.ssh directory
   - Writes SSH private key to ~/.ssh/id_rsa using printf to avoid shell interpretation
   - Sets proper permissions (600) on the private key
   - Validates all SSH variables are set
   - Adds Hostinger host to known hosts using ssh-keyscan

8. **Test SSH Connection**
   - Tests connectivity to the Hostinger server with timeout
   - Verifies authentication works

9. **Create Deployment Archive**
   - Creates a clean temporary directory
   - Copies all necessary files (excluding node_modules, caches, .git, .github, and the temp directory itself)
   - Creates a compressed tarball for deployment
   - Cleans up temporary files

10. **Deploy Application**
    - Uploads the tarball to the server via SCP
    - SSH into the server to:
      - Extract the tarball to the target directory
      - Set proper file (644) and directory (755) permissions
      - Ensure storage and bootstrap/cache directories are writable
      - Attempt to set ownership (continues if not permitted)
      - Verify .env file exists and set correct permissions (644)
      - Generate APP_KEY if missing or empty
      - Navigate to project directory
      - Run Laravel commands:
        * `php artisan optimize:clear` - Clear all cached data
        * `php artisan config:cache` - Cache configuration
        * `php artisan route:cache` - Cache routes
        * `php artisan view:cache` - Cache views
        * `php artisan migrate --force` - Run database migrations
        * `php artisan db:seed --force` - Run database seeders
    - Cleans up the uploaded tarball

11. **Cleanup**
    - Removes the deployment tarball from the GitHub Actions runner

## Required GitHub Secrets
For the workflow to function correctly, these secrets must be set in the repository Settings > Secrets > Actions:

- `SSH_PRIVATE_KEY` - Your Hostinger SSH private key
- `SSH_HOST` - Your Hostinger SSH host (e.g., srvXXX.hostinger.com or IP address)
- `SSH_PORT` - Usually `65002` for Hostinger shared hosting
- `SSH_USERNAME` - Your Hostinger FTP/SSH username

## Expected Application URLs After Deployment
- **Frontend**: https://arbitercoffeeshop.com (serves the React build)
- **Backend/API**: https://arbitercoffeeshop.com/api/ (Laravel endpoints)

## Troubleshooting
If the deployment fails, check the GitHub Actions logs for:
1. Which step failed and the specific error message
2. For SSH-related issues: verify the SSH secrets are correctly set
3. For build issues: check frontend/build logs for npm errors
4. For Laravel issues: check if .env file contains correct database credentials
5. For permission issues: verify file/directory permissions on the server

The workflow includes extensive debugging output (set -euxo pipefail) to help identify issues quickly.