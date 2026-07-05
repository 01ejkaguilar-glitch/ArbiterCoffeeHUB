# CACHE-CLEARING.md

This document outlines the procedures for clearing various caches in the Arbiter Coffee Hub system.

## Purpose
To ensure data consistency and optimal performance by providing standardized procedures for clearing application, configuration, route, view, and other caches.

## Scope
This procedure applies to all caching mechanisms used in the Arbiter Coffee Hub application including:
- Laravel application cache
- Configuration cache
- Route cache
- View/Blade template cache
- Event cache
- Route cache
- Compiled services container
- OPcache (PHP opcode cache)
- Redis cache (if used for caching)
- Browser cache (via cache-busting)

## Responsibilities
- **DevOps Engineer**: Maintains cache clearing procedures and automation
- **On-call Engineer**: Executes cache clearing procedures during incidents
- **Backend Developer**: Ensures proper cache tagging and invalidation in application code
- **Quality Assurance Engineer**: Verifies cache clearing doesn't break functionality

## Prerequisites
- Access to application server with appropriate privileges
- Understanding of Laravel caching system
- Access to command line interface (CLI) on application servers
- Knowledge of current caching implementation and tagged caches
- Backup procedures verified (when applicable)

## Cache Types and Purposes

### Application Cache
Stores application data that is expensive to compute or fetch.
- **Location**: `storage/framework/cache/data`
- **Purpose**: Improves performance by caching expensive operations
- **Clear When**: Data sources change, cache corruption suspected

### Configuration Cache
Contains all configuration files loaded into a single file.
- **Location**: `bootstrap/cache/config.php`
- **Purpose**: Reduces filesystem I/O by loading all config at once
- **Clear When**: Configuration files (.env, config/*.php) are modified

### Route Cache
Contains all route definitions in a single file.
- **Location**: `bootstrap/cache/routes.php`
- **Purpose**: Speeds up route registration
- **Clear When**: Routes files (routes/*.php) are modified

### View/Blade Template Cache
Contains compiled Blade templates.
- **Location**: `storage/framework/views`
- **Purpose**: Avoids recompiling Blade templates on each request
- **Clear When**: Blade template files are modified

### Event Cache
Contains cached event and listener mappings.
- **Location**: `bootstrap/cache/services.json`, `bootstrap/cache/packages.php`, `bootstrap/cache/services.php`
- **Purpose**: Speeds up event listener registration
- **Clear When**: Events or listeners are added/removed

### Compiled Services Container
Contains the compiled service container for faster bootstrapping.
- **Location**: `bootstrap/cache/app.php`
- **Purpose**: Speeds up application bootstrapping
- **Clear When**: Service providers or bindings are modified

### OPcache (PHP Opcode Cache)
Caches compiled PHP bytecode.
- **Purpose**: Avoids reparsing PHP files on each request
- **Clear When**: PHP files are modified (requires restart or manual clear)

### Redis Cache
External cache used for session storage, queueing, and application caching.
- **Purpose**: Distributed caching for improved performance and sharing
- **Clear When**: Shared data needs to be invalidated

## Cache Clearing Procedures

### Clearing All Caches (Safe Method)
Use Laravel's built-in cache clearing commands:

```bash
# Clear application cache
php artisan cache:clear

# Clear configuration cache
php artisan config:clear

# Clear route cache
php artisan route:clear

# Clear view cache
php artisan view:clear

# Clear compiled services container
php artisan clear-compiled

# Clear all caches at once (convenience method)
php artisan optimize:clear
```

### Clearing Specific Cache Types

#### Application Cache Only
```bash
php artisan cache:clear
# Or to forget specific keys
php artisan cache:forget key-name
# Or to flush entire cache storage (use with caution)
php artisan cache:flush
```

#### Configuration Cache Only
```bash
php artisan config:cache  # Rebuilds cache
php artisan config:clear  # Clears cache
```

#### Route Cache Only
```bash
php artisan route:cache  # Rebuilds cache
php artisan route:clear  # Clears cache
```

#### View Cache Only
```bash
php artisan view:cache  # Rebuilds cache
php artisan view:clear  # Clears cache
```

#### Event and Services Cache Only
```bash
php artisan optimize:clear  # Clears all optimized files
# Or manually delete specific files:
rm bootstrap/cache/services.php
rm bootstrap/cache/services.json
rm bootstrap/cache/packages.php
```

### Clearing OPcache
```bash
# Using opcache_reset() function via artisan
php artisan tinker --execute='opcache_reset();'

# Using cachetool (if installed)
cachetool opcache:reset --fcgi=/var/run/php/php8.1-fpm.sock

# Restarting PHP-FPM (most reliable)
sudo systemctl restart php8.1-fpm
# or
sudo service php8.1-fpm restart
```

### Clearing Redis Cache
```bash
# Flush specific database (use with caution)
redis-cli -n 0 FLUSHDB

# Flush all databases (use extreme caution)
redis-cli FLUSHALL

# Delete keys matching pattern (safer)
redis-cli KEYS "cache:*" | xargs redis-cli DEL

# Using Laravel Redis facade
php artisan tinker --execute='Redis::flush();'
```

### Cache-Busting for Assets
For frontend assets (CSS, JS, images):

```bash
# Versioning approach (recommended)
# Update version in mix() calls or manifest.json

# Cache-control headers approach
# Update Cache-Control headers in web server config

# Filename changing approach
# Rename files or use hashes in filenames (webpack mix does this automatically)
```

### Selective Cache Clearing by Tag
If using cache tagging (recommended for application cache):

```bash
# Clear all cache items with a specific tag
php artisan cache:forget-tag tag-name

# Clear multiple tags
php artisan cache:forget-tag tag1 tag2 tag3

# Clear all tagged cache items
php artisan cache:flush-tag tag-name
```

## Validation Procedures

### Cache Clearing Validation Checklist
- [ ] Application loads successfully after cache clearing
- [ ] Core functionality (login, checkout, product browsing) works correctly
- [ ] No PHP errors or warnings in application logs
- [ ] Performance metrics remain within acceptable ranges
- [ ] Data consistency verified (no stale or missing data)
- [ ] User sessions maintained appropriately (if applicable)
- [ ] External API integrations continue to function

## Monitoring and Alerting

### Cache-Related Metrics to Monitor
- **Cache Hit Ratio**: Percentage of requests served from cache
- **Cache Miss Rate**: Percentage of requests requiring backend computation
- **Cache Memory Usage**: Memory consumed by cache systems
- **Cache Eviction Rate**: Rate at which items are removed from cache
- **Cache Latency**: Average time to retrieve items from cache

### Cache Health Checks
- Verify cache services are responding (Redis ping test)
- Check cache memory usage doesn't exceed thresholds
- Validate cache key distribution is even (no hot keys)
- Ensure cache expiration policies are working correctly

## Troubleshooting

### Common Cache Issues
1. **Application Broken After Cache Clear**
   - Check if recent code changes are compatible with cache clearing
   - Verify configuration files are syntactically correct
   - Look for missing environment variables after config cache clear
   - Examine PHP syntax errors in recently modified files

2. **High Database Load After Cache Clear**
   - Expected temporary increase as caches rebuild
   - Monitor database connections and query performance
   - Consider warming caches before peak traffic periods
   - Check for inefficient queries that should be cached

3. **Cache Not Clearing Properly**
   - Verify correct cache driver is configured in .env
   - Check file permissions on cache directories
   - Confirm artisan commands are running on correct server
   - Look for caching middleware that bypasses explicit clears

4. **Stale Data After Cache Clear**
   - Ensure all cache stores are cleared (file, redis, etc.)
   - Check for application-level caching outside Laravel
   - Verify CDN or proxy caching isn't serving stale content
   - Look for persistent object caching in extensions

## Related Documents
- [Application Architecture](../architecture/ARCHITECTURE-OVERVIEW.md)
- [Deployment Guide](../deployment/DEPLOYMENT-GUIDE.md)
- [Performance Optimization](../performance/PERFORMANCE-OPTIMIZATION-GUIDE.md)
- [Runbook Index](../RUNBOOK-INDEX.md)

## Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-01 | Platform Team | Initial version |
| 1.1 | 2026-06-08 | DevOps Team | Added OPcache clearing procedures |
| 1.2 | 2026-06-12 | Platform Team | Added cache tagging procedures |
| 1.3 | 2026-06-18 | Backend Team | Updated Redis cache procedures |
| 1.4 | 2026-06-22 | DevOps Team | Added validation and troubleshooting |
| 1.5 | 2026-06-25 | Platform Team | Enhanced monitoring guidelines |

## Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Engineer | [Name] | [Signature] | [Date] |
| Engineering Manager | [Name] | [Signature] | [Date] |
| Security Officer | [Name] | [Signature] | [Date] |