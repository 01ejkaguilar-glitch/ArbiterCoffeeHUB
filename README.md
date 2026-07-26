# ArbiterCoffeeHUB

## Project Overview
ArbiterCoffeeHUB is a full-stack web application featuring a React frontend and Laravel backend, designed for coffee shop management. The application uses a modern API-first architecture with Sanctum authentication for SPA security.

## Current Status
- **Status**: Production Ready
- **Version**: 1.2.1
- **Last Updated**: July 2026
- **Deployment Target**: Hostinger Shared Hosting (with subdomain separation)

## System Architecture
```
Frontend (React):   arbitercoffeeshop.com
    ↓ (HTTPS API calls)
Backend (Laravel):  api.arbitercoffeeshop.com
    ↓ (MySQL)
Database:           u576753664_ArbiterCoffee
```

## Key Features
- Role-based access control (Admin, Manager, Barista, Staff)
- RESTful API with Laravel Sanctum authentication
- React frontend with modern hooks and context API
- MySQL database with Redis caching
- Automated deployment via GitHub Actions
- WCAG 2.1 AA accessibility compliance
- Docker-ready configuration

## Project Structure
```
/
├── .github/                 # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml       # CI/CD pipeline for Hostinger
├── frontend/                # React application
│   ├── public/
│   ├── src/
│   └── package.json
├── api/                     # Laravel application (symlinked to public_html/api on server)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   └── composer.json
├── .env.example             # Template for environment variables
├── .gitignore
├── composer.json
├── package.json
└── README.md
```

## Environment Setup

### Local Development
1. Copy `.env.example` to `.env` and configure:
   ```env
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://localhost
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=arbiter_coffee_hub
   DB_USERNAME=root
   DB_PASSWORD=secret
   ```
2. Create frontend environment file:
   ```env
   # frontend/.env.development
   REACT_APP_API_URL=http://localhost:8000/api
   ```
3. Install dependencies:
   ```bash
   composer install
   npm install
   ```
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations:
   ```bash
   php artisan migrate
   ```
6. Start development servers:
   ```bash
   php artisan serve --port=8000 &
   npm start
   ```

### Production Deployment (Hostinger)
The application is configured for deployment to Hostinger shared hosting with the following setup:

#### Domain Configuration
- **Main Domain**: `arbitercoffeeshop.com` → Serves React frontend from `/public_html/`
- **Subdomain**: `api.arbitercoffeeshop.com` → Serves Laravel backend from `/public_html/api/public/`

#### Required Environment Variables (Server .env)
Create `/domains/arbitercoffeeshop.com/public_html/api/.env` with:
```env
APP_NAME=ArbiterCoffeeHub
APP_ENV=production
APP_KEY=[GENERATE_WITH: php artisan key:generate --show]
APP_DEBUG=false
APP_URL=https://api.arbitercoffeeshop.com

# Database (USE YOUR PROVIDED CREDENTIALS)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u576753664_ArbiterCoffee
DB_USERNAME=u576753664_ArbiterCoffee
DB_PASSWORD=Aguilar#0121

# Session & Sanctum Configuration (CRITICAL FOR SUBDOMAIN AUTH)
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.arbitercoffeeshop.com
SANCTUM_STATEFUL_DOMAINS=arbitercoffeeshop.com,api.arbitercoffeeshop.com

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://arbitercoffeeshop.com

# Mail (optional)
MAIL_MAILER=smtp
MAIL_HOST=[YOUR_SMTP_HOST]
MAIL_PORT=587
MAIL_USERNAME=[YOUR_EMAIL]
MAIL_PASSWORD=[YOUR_PASSWORD]
MAIL_ENCRYPTION=tls
```

#### Required GitHub Secrets
Set these in your repository Settings > Secrets > Actions:
```
FTP_HOST=82.25.120.186
FTP_USERNAME=u576753664
FTP_PASSWORD=Aguilar#0121
FTP_PORT=21

SSH_HOST=[FROM HOSTINGER SSH ACCESS]
SSH_PORT=[FROM HOSTINGER SSH ACCESS, USUALLY 65002]
SSH_USERNAME=[FROM HOSTINGER SSH ACCESS]
SSH_PRIVATE_KEY=[CONTENTS OF ~/.ssh/arbitercoffee_ssh]

# Optional: Slack notifications
SLACK_WEBHOOK_URL=[YOUR_SLACK_WEBHOOK_URL]
```

## Deployment Process
The GitHub Actions workflow (`.github/workflows/deploy.yml`) automates:
1. Code checkout and dependency installation
2. Frontend build (React production bundle)
3. Backend dependency installation (Composer)
4. FTP transfer to Hostinger
5. SSH-based post-deployment tasks:
   - Laravel optimization (config/cache/route caching)
   - Permission setting
   - Cache clearing and optimization
6. Deployment verification
3. Status notifications (Slack)

## Database Setup on Hostinger
1. In Hostinger hPanel → Databases → MySQL:
   - Create database: `u576753664_ArbiterCoffee`
   - Create user: `u576753664_ArbiterCoffee` with password `Aguilar#0121`
   - Assign user to database with all privileges
2. The application will automatically use these credentials via the `.env` file

## Important Notes
### Security
- **NEVER commit `.env` to Git** - it contains sensitive credentials
- The `.env.example` file is safe to commit as it contains only template values
- Always use environment-specific configuration files

### Troubleshooting
1. **Database Connection Issues**:
   - Verify `.env` DB credentials match Hostinger MySQL setup
   - Check user host restriction (should be `localhost` only on shared hosting)
   - Test with: `php artisan tinker --execute="DB::connection()->getPdo();"`

2. **Authentication Issues (419/Sessions)**:
   - Confirm `SESSION_DOMAIN=.arbitercoffeeshop.com` (note leading dot)
   - Verify `SANCTUM_STATEFUL_DOMAINS` includes both domains
   - Check Laravel logs: `storage/logs/laravel.log`

3. **CORS Errors**:
   - Ensure `config/cors.php` has:
     ```php
     'allowed_origins' => ['https://arbitercoffeeshop.com'],
     'supports_credentials' => true,
     ```

4. **API 404 Errors**:
   - Confirm subdomain document root points to `/public_html/api/public/`
   - Verify Laravel `.htaccess` is present in the public directory

## Development Commands
```bash
# PHP/Laravel
php artisan serve                 # Start dev server
php artisan migrate               # Run migrations
php artisan test                  # Run PHPUnit tests
php artisan queue:work           # Start queue worker
npm run dev                      # Start Vite dev server
npm run build                    # Build for production

# Database
php artisan migrate:fresh --seed  # Reset DB and seed
php artisan db:seed              # Run seeders
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is proprietary and confidential. All rights reserved.

## Contact
Project Maintainer: [Your Name/Team]
Last Deployment: [Auto-populated by GitHub Actions]
<!-- Last deployment test: 2026-07-26 14:54:47 -->
