# Contributing to Arbiter Coffee Hub

Thank you for considering contributing to Arbiter Coffee Hub! We welcome contributions from the community.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [Community](#community)

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report, please check if the issue has already been reported. When you are creating a bug report, please include:

1. **Clear and descriptive title**
2. **Detailed description** of the problem
3. **Steps to reproduce** the issue
4. **Expected behavior** vs **actual behavior**
5. **Screenshots** if applicable
6. **Environment details**:
   - PHP version
   - Laravel version
   - Node.js version
   - Browser and version (for frontend issues)
   - Relevant configuration settings

### Suggesting Features

Feature requests are welcome! Please provide:

1. **Clear title** describing the feature
2. **Detailed description** of what you'd like to see
3. **Use case** explaining why this feature would be valuable
4. **Possible implementation approach** (if you have ideas)
5. **Any drawbacks or considerations** you've thought about

### Your First Code Contribution

Unsure where to begin? Look for issues labeled with `good first issue` or `help wanted`. These are typically well-scoped tasks suitable for newcomers.

### Pull Request Process

1. **Fork the repository** and create your branch from `develop`
2. **Set up your development environment** following [SETUP.md](SETUP.md)
3. **Make your changes** following our coding standards
4. **Add or update tests** as appropriate
5. **Ensure all tests pass** locally
6. **Commit your changes** using conventional commit messages
7. **Push to your fork** and submit a pull request
8. **Update the PR description** to clearly explain your changes
9. **Respond to any review comments** promptly

## Development Setup

Please refer to [SETUP.md](SETUP.md) for detailed setup instructions covering:
- Prerequisites (PHP, Composer, Node.js, Database)
- Environment configuration
- Dependency installation
- Database setup
- Running the application
- Running tests

## Coding Standards

### PHP (Backend)

We follow [PSR-12](https://www.php-fig.org/psr/psr-12/) coding standard.

#### PHP Specific Guidelines:
- Use `declare(strict_types=1);` at the top of PHP files
- Type hint parameters and return types whenever possible
- Use meaningful, descriptive names for variables and functions
- Keep methods small and focused (prefer < 50 lines)
- Prefer composition over inheritance
- Use dependency injection instead of static facades when possible
- Follow Laravel's naming conventions for models, controllers, etc.

#### Laravel Specific:
- Use Eloquent ORM for database interactions
- Validate input using Form Requests
- Use Laravel's built-in pagination for lists
- Leverage Laravel's collection methods for data manipulation
- Use events and listeners for decoupling
- Queue long-running processes
- Use Laravel's caching system appropriately

#### Tools:
- **PHP_CodeSniffer**: `./vendor/bin/phpcs`
- **PHP_CBF** (auto-fix): `./vendor/bin/phpcbf`
- **Laravel Pint**: `./vendor/bin/pint`
- **PHPStan**: `./vendor/bin/phpstan analyse`
- **Psalm**: `./vendor/bin/psalm`

### JavaScript/JSX (Frontend)

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with React-specific extensions.

#### JavaScript Specific Guidelines:
- Use `const` and `let`, never `var`
- Prefer arrow functions for callbacks
- Use template literals for string concatenation
- Destructure objects and arrays when appropriate
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Keep functions small and focused
- Use meaningful variable and function names
- Comment complex logic

#### React Specific:
- Use functional components with hooks
- Follow React Hooks Rules
- Keep component state minimal
- Use React Query for server state management
- Component names should be PascalCase
- File names should match component names
- PropTypes or TypeScript interfaces for component props
- Separate concerns: presentation vs logic

#### Tools:
- **ESLint**: `npm run lint` (in frontend directory)
- **Prettier**: `npm run format` (in frontend directory)
- **TypeScript Compiler**: `npx tsc --noEmit` (if using TypeScript)

### Database

#### Migrations:
- Use descriptive names for migration classes
- Make migrations reversible when possible
- Use efficient indexes on frequently queried columns
- Consider foreign key constraints with appropriate cascade options
- Seed data should be realistic but not contain sensitive information

#### Models:
- Define relationships clearly
- Use Eloquent mutators/accessors for computed attributes
- Define scopes for reusable query constraints
- Use model events judiciously
- Keep models focused on data representation

### API Endpoints

#### Naming:
- Use RESTful resource naming (`/users`, `/posts`)
- Use plural nouns for collections
- Use HTTP verbs appropriately (GET, POST, PUT, PATCH, DELETE)
- Version your API in the URL (`/api/v1/resource`)

#### Responses:
- Return consistent JSON structure:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Optional message"
  }
  ```
- Use appropriate HTTP status codes
- Include pagination metadata for list endpoints
- Provide meaningful error messages

#### Security:
- Validate all input using Laravel Form Requests
- Authorize access using Policies and Gates
- Sanitize output to prevent XSS
- Use Laravel's built-in CSRF protection
- Implement rate limiting where appropriate
- Hash passwords using bcrypt

### Configuration

#### Environment Variables:
- Never commit real credentials to version control
- Use `.env.example` to document required variables
- Use clear, descriptive variable names
- Group related variables with comments
- Provide sensible defaults where possible

#### Config Files:
- Use Laravel's config system (`config/*.php`)
- Prefer environment variables over hardcoded values
- Group related settings in arrays
- Document complex configuration options

## Testing Guidelines

### Philosophy
We believe in testing that provides confidence without slowing down development.

### Types of Tests

#### Unit Tests
- Test individual methods and functions in isolation
- Mock dependencies
- Focus on business logic
- Fast and numerous

#### Feature Tests
- Test complete user workflows
- Interact with real database (using SQLite in memory for speed)
- Test API endpoints end-to-end
- Fewer but more comprehensive than unit tests

#### Browser/End-to-End Tests
- Test critical user journeys
- Use Laravel Dusk or Cypress
- Run against a test environment
- Slowest but most comprehensive

### Testing Practices

#### Backend (PHP):
- **PHPUnit**: Primary testing framework
- **Factories**: Use model factories for test data
- **RefreshDatabase**: Trait to reset database between tests
- **Mocking**: Use Mockery or PHPUnit mocks for dependencies
- **Assertions**: Use descriptive assertions
- **Test Names**: Use `test_` prefix or `@test` annotation

#### Frontend (JavaScript):
- **Jest**: Primary testing framework
- **React Testing Library**: For component testing
- **User Event**: For simulating user interactions
- **MSW**: For mocking API requests
- **Test Fluency**: Write tests that read like user stories

### Coverage Goals
- Aim for 80%+ line coverage on new code
- Critical paths should have near 100% coverage
- Don't sacrifice test quality for coverage numbers
- Delete or update tests when code changes

### Running Tests

#### Backend:
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --test=Feature/AuthTest

# Run with coverage
php artisan test --coverage

# Run PHPStan
./vendor/bin/phpstan analyse

# Run Pint (fix styling)
./vendor/bin/pint
```

#### Frontend:
```bash
# Install test dependencies (if needed)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run ESLint
npm run lint

# Run Prettier
npm run format
```

## Documentation Standards

### Code Comments
- Use PHPDoc for all public and protected methods
- Use JSDoc for all exported JavaScript functions and components
- Explain **why** not **what** in comments
- Keep comments up-to-date when code changes
- Remove commented-out code (use version control instead)

### README Files
- Keep README.md updated with current information
- Include badges for build status, coverage, etc.
- Provide clear getting-started instructions
- List major features and requirements

### Inline Documentation
- Document complex algorithms
- Explain non-obvious business logic
- Note any workarounds or hacks with clear markers (`TODO:` or `HACK:`)
- Reference related issues or tickets when applicable

### API Documentation
- Keep OpenAPI/Swagger annotations up-to-date
- Include request/response examples
- Document all parameters, headers, and response codes
- Mark deprecated endpoints appropriately

### Changelog
- Keep CHANGELOG.md updated for each release
- Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
- Group changes by type: Added, Changed, Deprecated, Removed, Fixed, Security

## Community

### Communication Channels
- **Issues**: Bug reports, feature requests, questions
- **Pull Requests**: Code contributions and discussions
- **Discussions**: General conversations, ideas, showcases
- **Security Issues**: Please email security@arbitercoffee.com directly

### Getting Help
- Check existing documentation first
- Search closed issues for similar problems
- Ask in the appropriate GitHub discussion area
- For urgent issues, contact maintainers directly

### Recognition
Contributors will be acknowledged in:
- Release notes
- CONTRIBUTORS.md file
- Project README (for significant contributions)
- Project website or documentation (as appropriate)

## License

By contributing to Arbiter Coffee Hub, you agree that your contributions will be licensed under the project's MIT License.

## Questions?

If you have questions not covered in this guide, please open an issue asking for clarification. We're happy to help!

Thank you for contributing to Arbiter Coffee Hub!

*Last updated: June 2026*