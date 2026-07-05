# Arbiter Coffee Hub - Onboarding Guide

Welcome to the Arbiter Coffee Hub development team! This guide will help you get acquainted with the project, understand the codebase, and start contributing effectively.

## Table of Contents
- [Welcome](#welcome)
- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Key Components](#key-components)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Getting Help](#getting-help)
- [First Contribution](#first-contribution)

## Welcome

Thank you for joining the Arbiter Coffee Hub team! This document will help you understand our project and get productive quickly.

## Project Overview

Arbiter Coffee Hub is a comprehensive coffee shop management system built with Laravel (PHP) backend and React frontend. The system includes:

- **Point of Sale (POS)**: Manage sales, inventory, and customer transactions
- **Analytics Dashboard**: Track sales performance, customer behavior, and inventory metrics
- **Employee Management**: Handle staff scheduling, permissions, and performance
- **Supply Chain**: Manage suppliers, purchases, and inventory levels
- **Customer Relationship Management**: Track customer preferences and loyalty programs
- **Reporting & Analytics**: Generate business intelligence reports

## Architecture Overview

### Backend (Laravel)
- **Framework**: Laravel 10.x (PHP 8.2+)
- **Architecture**: MVC with Service Repository pattern
- **Authentication**: Laravel Sanctum for API token authentication
- **Authorization**: Spatie Laravel Permissions for role-based access control
- **Caching**: Redis with file fallback
- **Queue System**: Database queues for background jobs
- **Real-time Features**: Pusher/Laravel Echo for WebSocket connections
- **API Documentation**: OpenAPI/Swagger via l5-swagger package

### Frontend (React)
- **Library**: React 18 with React Router DOM
- **State Management**: React Query for server state, React Context for UI state
- **Styling**: Bootstrap 5 with custom SCSS
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Yup validation
- **Data Visualization**: Recharts for charts and graphs
- **Notifications**: React Hot Toast for user notifications
- **Error Tracking**: Sentry integration

### Infrastructure
- **Database**: MySQL 8.0+ (primary), Redis (caching/queues)
- **Web Server**: PHP built-in server for development, Nginx/Apache for production
- **Build Tools**: Composer (PHP), NPM/Yarn (Node.js)
- **Testing**: PHPUnit (backend), Jest + React Testing Library (frontend)
- **CI/CD**: GitHub Actions (configured separately)

## Key Components

### Backend Modules

#### App\Http\Controllers\Api\
RESTful API controllers organized by version:
- `V1/AuthController` - Authentication endpoints
- `V1/ProductController` - Product management
- `V1/OrderController` - Order processing
- `V1/CustomerController` - Customer management
- `V1/EmployeeController` - Employee management
- `V1/AnalyticsController` - Business analytics
- `V1/InventoryController` - Inventory tracking

#### App\Models\
Eloquent models representing database entities:
- `User` - System users and employees
- `Customer` - Customer information
- `Product` - Menu items and inventory
- `Order` - Customer orders
- `OrderItem` - Individual items in orders
- `Inventory` - Stock levels and movements
- `Employee` - Staff members
- `Shift` - Work shifts and schedules

#### App\Services\
Business logic services:
- `OrderService` - Order processing logic
- `InventoryService` - Stock management
- `AnalyticsService` - Data aggregation and reporting
- `NotificationService` - Email/SMS/push notifications

#### App\Providers\
Service providers for binding interfaces:
- `AppServiceProvider` - Core bindings
- `EventServiceProvider` - Event listeners
- `RepositoryServiceProvider` - Repository interfaces

### Frontend Structure

#### frontend/src/
- `components/` - Reusable UI components
  - `layout/` - Page layouts (Header, Footer, Sidebar)
  - `ui/` - Primitive components (Button, Input, Modal)
  - `pages/` - Page-level components
  - `hooks/` - Custom React hooks
  - `context/` - React Context providers
  - `services/` - API service wrappers
  - `utils/` - Utility functions
  - `store/` - Global state management (if applicable)
  - `routes/` - Route definitions and protection

#### frontend/public/
- `index.html` - Main HTML template
- Manifest and icon files for PWA support

## Development Workflow

### Daily Routine
1. Pull latest changes from main branch
2. Check for any environment updates
3. Run local development servers
4. Work on assigned tasks in feature branches
5. Submit pull requests for review

### Branching Strategy
- `main` - Production-ready stable code
- `develop` - Integration branch for features
- `feature/*` - New feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `release/*` - Release preparation

### Making Changes
1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/description
   ```

2. Make your changes following coding standards

3. Test your changes locally:
   - Backend: `php artisan test` or specific test suites
   - Frontend: `npm test` in frontend directory
   - Manual testing: Verify functionality in browser

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve issue with description"
   ```

5. Push and create Pull Request:
   ```bash
   git push origin feature/description
   ```

6. Request review from team members

### Code Review Process
1. PRs must have at least one approval
2. All CI checks must pass
3. Address review comments promptly
4. Squash commits before merging if requested
5. Delete feature branch after merge

## Code Standards

### Backend (PHP)
- **Standard**: PSR-12 coding standard
- **Tool**: Laravel Pint for auto-fixing
- **Command**: `./vendor/bin/pint`
- **PHPStan**: Static analysis level 8
- **PHPUnit**: Test coverage minimum 80%

### Frontend (JavaScript/JSX)
- **Standard**: Airbnb JavaScript style guide (via ESLint)
- **React**: Functional components with hooks
- **TypeScript**: Gradual migration in progress
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Comments**: JSDoc for complex functions

### Database
- **Migrations**: Descriptive names, reversible when possible
- **Seeding**: Factories for test data, seeders for demo data
- **Indexes**: Proper indexing on query columns
- **Foreign Keys**: CASCADE constraints where appropriate

### API Design
- **RESTful**: Standard HTTP verbs and status codes
- **Versioning**: URI versioning (/api/v1/)
- **Responses**: Consistent JSON format with success/data/message structure
- **Pagination**: Laravel paginator with meta information
- **Validation**: Form Request validation
- **Authentication**: Sanctum token-based auth
- **Rate Limiting**: Configured per route/group

## Getting Help

### Documentation
- **Setup Guide**: `SETUP.md` - Installation and configuration
- **API Documentation**: `http://localhost:8000/api/documentation` (when running)
- **Technical Docs**: `docs/` directory
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

### Communication
- **Team Chat**: [Specify your team's communication platform]
- **Issue Tracker**: [GitHub Issues/Jira/etc.]
- **Code Reviews**: GitHub Pull Requests
- **Daily Standups**: [Time and format]

### Resources
- **Laravel Documentation**: https://laravel.com/docs/10.x
- **React Documentation**: https://react.dev/
- **Bootstrap Documentation**: https://getbootstrap.com/
- **React Query**: https://tanstack.com/query/latest
- **Framer Motion**: https://www.framer.com/motion/

## First Contribution

Your first contribution should be small and well-scoped to help you learn our processes:

### Suggested First Tasks
1. **Documentation Improvement**: Fix typos or add clarifications to existing docs
2. **Bug Fix**: Pick up a "good first issue" from our issue tracker
3. **Test Improvement**: Add missing tests for existing functionality
4. **Code Quality**: Run PHPStan/Pint fixes and submit improvements

### Example First PR
1. Fix a typo in documentation
2. Add missing PHPDoc to a method
3. Improve error message clarity in validation
4. Add unit test for a helper function

Remember:
- Ask questions if you're unsure
- Start small and build confidence
- Follow our coding standards
- Write tests for new functionality
- Keep PRs focused on a single concern

## Welcome to the Team!

We're excited to have you here. Don't hesitate to reach out to your teammates for help. Together we'll build amazing features for Arbiter Coffee Hub!

*Last updated: June 2026*