# Environment Variables Reference

This document provides a comprehensive reference for all environment variables used in the Arbiter Coffee Hub application.

## Application Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| APP_NAME | Application name | String | No | Laravel | None |
| APP_ENV | Application environment (local, testing, production) | String | No | production | Should be set to production in production environments |
| APP_KEY | Application encryption key | 32-character string | Yes | (none) | Must be kept secret and rotated periodically |
| APP_DEBUG | Enable debug mode | Boolean (true/false) | No | false | Must be false in production |
| APP_URL | Base URL of the application | URL | No | http://localhost | Should be set to the actual domain in production |
| APP_LOCALE | Default locale | String | No | en | None |
| APP_FALLBACK_LOCALE | Fallback locale | String | No | en | None |
| APP_FAKER_LOCALE | Locale for Faker seeders | String | No | en_US | None |
| APP_MAINTENANCE_DRIVER | Maintenance mode driver (file, cache) | String | No | file | None |
| APP_MAINTENANCE_STORE | Maintenance mode store (database, cache) | String | No | database | None |
| FRONTEND_URL | Base URL of the frontend application | URL | No | http://localhost:3000 | Used in email links; should be set to the actual frontend domain |

## Bcrypt Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| BCRYPT_ROUNDS | Logarithmic number of rounds for bcrypt hashing | Integer (4-31) | No | 12 | Higher values increase security but slow down hashing |

## Logging Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| LOG_CHANNEL | Default log channel | String | No | stack | None |
| LOG_STACK | Stack channel driver | String | No | single | None |
| LOG_DEPRECATIONS_CHANNEL | Channel for deprecation logs | String | No | null | None |
| LOG_LEVEL | Default log level | String | No | debug | In production, should be set to error or warning |

## Database Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| DB_CONNECTION | Database connection type (mysql, pgsql, sqlite, sqlsrv) | String | No | mysql | None |
| DB_HOST | Database host | String | Yes | 127.0.0.1 | Should be protected from direct internet access |
| DB_PORT | Database port | Integer | Yes | 3306 | Should be protected from direct internet access |
| DB_DATABASE | Database name | String | Yes | none | None |
| DB_USERNAME | Database username | String | Yes | none | Should be a limited-privilege user |
| DB_PASSWORD | Database password | String | Yes | none | Must be kept secret and rotated periodically |

## Session Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| SESSION_DRIVER | Session driver (file, cookie, database, array, memcached, redis, dynamodb) | String | No | database | database and redis are preferred for multi-server environments |
| SESSION_LIFETIME | Session lifetime in minutes | Integer | No | 120 | Should be set appropriately for security vs usability |
| SESSION_ENCRYPT | Enable session encryption | Boolean | No | false | Should be true for sensitive applications |
| SESSION_PATH | Session cookie path | String | No | / | None |
| SESSION_DOMAIN | Session cookie domain | String | No | none | Used for subdomain sharing |

## Broadcasting Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| BROADCAST_CONNECTION | Default broadcasting connection (log, pusher, redis, etc.) | String | No | log | None |
| BROADCAST_DRIVER | Default broadcast driver | String | No | log | None |

## Filesystem Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|----------|----------|
| CACHE_STORE | Default cache store (array, file, database, memcached, redis, dynamodb) | String | No | database | redis is recommended for performance |

## Queue Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| QUEUE_CONNECTION | Default queue connection (sync, database, beanstalkd, sqs, redis, null) | String | No | database | redis or sqs recommended for production |

## Cache----------|----------|----------|
| Filesystem Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| FILESYSTEM_DISK | Default filesystem disk (local, s3, rackspace, etc.) | String | No | local | For production, consider using S3 or similar for user uploads |

## Pusher Configuration (for broadcasting and notifications)

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| PUSHER_APP_ID | Pusher application ID | String | No | none | None |
| PUSHER_APP_KEY | Pusher application key | String | No | none | Should be kept secret |
| PUSHER_APP_SECRET | Pusher application secret | String | No | none | Must be kept secret |
| PUSHER_HOST | Pusher host | String | No | None | None |
| PUSHER_PORT | Pusher port | Integer | No | 443 | None |
| PUSHER_SCHEME | Pusher scheme (http, https) | String | No | https | Should be https in production |
| PUSHER_APP_CLUSTER | Pusher app cluster | String | No | mt1 | None |

## Memcached Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| MEMCACHED_HOST | Memcached host | String | No | 127.0.0.1 | Should be protected from direct internet access |

## Redis Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| REDIS_CLIENT | Redis client (predis, phpredis) | String | No | predis | None |
| REDIS_HOST | Redis host | String | No | 127.0.0.1 | Should be protected from direct internet access |
| REDIS_PASSWORD | Redis password | String | No | null | Should be set if Redis authentication is required |
| REDIS_PORT | Redis port | Integer | No | 6379 | Should be protected from direct internet access |

## Mail Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| MAIL_MAILER | Mailer (smtp, sendmail, mailgun, ses, postmark, log, array) | String | No | log | In production, should be set to a real mailer |
| MAIL_SCHEME | Mail scheme | String | No | None | None |
| MAIL_HOST | Mail host | String | No | 127.0.0.1 | None |
| MAIL_PORT | Mail port | Integer | No | 2525 | None |
| MAIL_USERNAME | Mail username | String | No | none | May contain credentials |
| MAIL_PASSWORD | Mail password | String | No | none | May contain credentials |
| MAIL_FROM_ADDRESS | Default from address | Email | No | hello@example.com | None |
| MAIL_FROM_NAME | Default from name | String | No | ${APP_NAME} | None |

## AWS Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| AWS_ACCESS_KEY_ID | AWS access key ID | String | No | none | Must be kept secret and rotated |
| AWS_SECRET_ACCESS_KEY | AWS secret access key | String | No | none | Must be kept secret and rotated |
| AWS_DEFAULT_REGION | AWS default region | String | No | us-east-1 | None |
| AWS_BUCKET | Default S3 bucket | String | No | none | None |
| AWS_USE_PATH_STYLE_ENDPOINT | Use path-style endpoint for S3 | Boolean | No | false | None |

## Vite Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| VITE_APP_NAME | Vite application name | String | No | ${APP_NAME} | None |

## CORS Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| CORS_ALLOWED_ORIGINS | Comma-separated list of allowed origins for CORS | String | No | http://localhost:3000,http://127.0.0.1:3000 | Should be restricted to actual domains in production |

## Push Notifications (VAPID) Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| VAPID_PUBLIC_KEY | VAPID public key for push notifications | String | No | none | None |
| VAPID_PRIVATE_KEY | VAPID private key for push notifications | String | No | none | Must be kept secret |
| VAPID_SUBJECT | VAPID subject (mailto: or https://) | String | No | mailto:admin@arbitercoffeeshop.com | None |

## Prerender.io Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| PRERENDER_ENABLE | Enable prerender.io | Boolean | No | false | None |
| PRERENDER_TOKEN | Prerender.io token | String | No | none | If used, must be kept secret |
| PRERENDER_URL | Prerender.io service URL | String | No | https://service.prerender.io | None |

## Payment Gateway Configuration

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| GCASH_API_URL | GCash API URL | String | No | https://api.gcash.com/v1 | None |
| GCASH_API_KEY | GCash API key | String | No | none | Must be kept secret |
| GCASH_MERCHANT_ID | GCash merchant ID | String | No | none | None |
| GCASH_WEBHOOK_SECRET | GCash webhook secret | String | No | none | Must be kept secret |
| MAYA_API_URL | Maya API URL | String | No | https://pg-sandbox.paymaya.com | None |
| MAYA_PUBLIC_KEY | Maya public key | String | No | none | None |
| MAYA_SECRET_KEY | Maya secret key | String | No | none | Must be kept secret |
| MAYA_WEBHOOK_SECRET | Maya webhook secret | String | No | none | Must be kept secret |
| PAYPAL_CLIENT_ID | PayPal client ID | String | No | none | Must be kept secret |
| PAYPAL_CLIENT_SECRET | PayPal client secret | String | No | none | Must be kept secret |
| PAYPAL_MODE | PayPal mode (sandbox or live) | String | No | sandbox | Should be live in production |
| STRIPE_KEY | Stripe publishable key | String | No | none | None |
| STRIPE_SECRET | Stripe secret key | String | No | none | Must be kept secret |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | String | No | none | Must be kept secret |
| PAYMENT_DEFAULT_GATEWAY | Default payment gateway (gcash, maya, stripe, paypal) | String | No | gcash | None |

## System Configuration (from system_configs table)

Note: These variables are not used directly; instead, values are stored in the `system_configs` database table. However, they may be referenced in configuration files or code.

| Variable | Purpose | Format | Required | Default | Security Considerations |
|----------|---------|--------|----------|---------|-------------------------|
| (None specific) | Various system configurations are stored in the database and managed via the admin interface. | | | | |

## Notes

1. **Required Variables**: Variables marked as "Required" must be set in the `.env` file for the application to function correctly. Missing required variables will cause the application to fail during boot (thanks to the EnvironmentValidationServiceProvider).

2. **Security Considerations**: 
   - All secrets (keys, passwords, tokens) should be kept confidential and rotated periodically.
   - In production, ensure that debugging features are disabled (APP_DEBUG=false).
   - Restrict direct access to database, cache, and other services to only the application servers.
   - Use environment-specific .env files (e.g., .env.production) and ensure they are never committed to version control.

3. **Default Values**: Default values are provided for convenience in local development. In production, it is recommended to explicitly set all variables to appropriate values.

4. **Variable Groups**: Variables are grouped by their primary area of use (application, database, caching, etc.) for easier reference.

5. **Updating This Document**: This document should be updated whenever environment variables are added, removed, or modified.

## Related Documentation

- [Configuration Drift Detection](./configuration-drift-detection.md) - Guide for detecting configuration drift between environments