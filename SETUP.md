# Arbiter Coffee Hub - Setup Guide

This document provides step-by-step instructions for setting up the Arbiter Coffee Hub development environment.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Running Tests](#running-tests)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2
- **Composer** (PHP dependency manager)
- **Node.js** >= 18.x
- **npm** or **yarn** (Node.js package manager)
- **MySQL** >= 8.0 or **MariaDB** >= 10.5
- **Git** (version control)

## Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ArbiterCoffeeHUB
   ```

2. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Generate application key**:
   ```bash
   php artisan key:generate
   ```

## Backend Setup

### PHP Dependencies

Install PHP dependencies using Composer:
```bash
composer install
```

### Database Configuration

1. Create a MySQL database:
   ```sql
   CREATE DATABASE arbiter_coffee_hub;
   ```

2. Update your `.env` file with database credentials:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=arbiter_coffee_hub
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

### Database Migrations

Run database migrations to set up the schema:
```bash
php artisan migrate
```

### Database Seeding (Optional)

To populate the database with sample data:
```bash
php artisan db:seed
```

## Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install Node.js dependencies:
```bash
npm install
# or
yarn install
```

Return to the project root:
```bash
cd ..
```

## Running Tests

### Backend Tests

Run PHPUnit tests:
```bash
./vendor/bin/phpunit
```

### Frontend Tests

Run Jest tests:
```bash
cd frontend
npm test
# or
yarn test
```

## Running the Application

### Backend Server

Start the Laravel development server:
```bash
php artisan serve
```

The backend API will be available at: `http://localhost:8000`

### Frontend Development Server

In a separate terminal, start the React development server:
```bash
cd frontend
npm start
# or
yarn start
```

The frontend will be available at: `http://localhost:3000`

### Using Laravel Sail (Alternative)

If you prefer using Docker, you can use Laravel Sail:
```bash
./vendor/bin/sail up
```

## Environment Variables

Key environment variables in `.env`:

- `APP_NAME` - Application name
- `APP_ENV` - Environment (local, production, etc.)
- `APP_DEBUG` - Enable debug mode
- `APP_URL` - Application URL
- `FRONTEND_URL` - Frontend application URL
- `DB_*` - Database connection settings
- `MAIL_*` - Email configuration
- `PUSHER_*` - Pusher/Ratchet configuration for real-time features
- `VAPID_*` - VAPID keys for push notifications

## Project Structure

```
ArbiterCoffeeHUB/
├── app/                    # Laravel application code
├── bootstrap/              # Bootstrap files
├── config/                 # Configuration files
├── database/               # Database migrations and seeders
├── public/                 # Publicly accessible assets
├── resources/              # Views, languages, assets
├── routes/                 # Route definitions
├── storage/                # Storage, logs, cache
├── tests/                  # Automated tests
├── vendor/                 # Composer dependencies
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   └── src/                # React components
├── .env                    # Environment variables
├── artisan                 # Laravel CLI
└── composer.json           # PHP dependencies
```

## API Documentation

API documentation is available via Swagger UI when the application is running:
- URL: `http://localhost:8000/api/documentation`
- Alternative: `http://localhost:8000/api/docs`

## Development Workflow

1. Create a new branch for your feature/bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit frequently:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to remote and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Ensure your code follows PSR-12 standards:
   ```bash
   ./vendor/bin/pint
   ```

## Troubleshooting

### Common Issues

**"Could not open input file: artisan"**
- Ensure you're in the project root directory where the `artisan` file exists

**"Connection refused" database errors**
- Verify MySQL/MariaDB is running
- Check database credentials in `.env`
- Ensure the database exists

**"Module not found" errors in frontend**
- Delete `node_modules` and `package-lock.json`, then reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Getting Help

- Check the `logs/` directory for application logs
- Refer to the `docs/` directory for detailed technical documentation
- Consult the `IMPLEMENTATION_SUMMARY.md` for recent implementation details