# Troubleshooting Guide for Arbiter Coffee Hub

This document provides solutions to common issues encountered during development, testing, and deployment of Arbiter Coffee Hub.

## Table of Contents
- [Installation Issues](#installation-issues)
- [Database Problems](#database-problems)
- [Configuration Issues](#configuration-issues)
- [Backend Errors](#backend-errors)
- [Frontend Problems](#frontend-problems)
- [Testing Issues](#testing-issues)
- [Performance Problems](#performance-problems)
- [Deployment Issues](#deployment-issues)
- [Getting Further Help](#getting-further-help)

## Installation Issues

### Composer Installation Fails
**Symptoms**: `composer install` fails with memory limit or timeout errors

**Solutions**:
1. Increase PHP memory limit:
   ```bash
   COMPOSER_MEMORY_LIMIT=-1 composer install
   ```
2. Increase timeout:
   ```bash
   COMPOSER_PROCESS_TIMEOUT=500 composer install
   ```
3. Try with `--no-scripts` to skip scripts, then run them manually:
   ```bash
   composer install --no-scripts
   composer run-script post-root-package-install
   composer run-script post-create-project-cmd
   ```

### Node.js Installation Fails
**Symptoms**: `npm install` fails with various errors

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete node_modules and package-lock.json, then reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Try using yarn instead:
   ```bash
   yarn install
   ```
4. Check Node.js version compatibility:
   ```bash
   node --version  # Should be >=18.x
   ```

### Environment File Issues
**Symptoms**: Application fails to start or behaves unexpectedly

**Solutions**:
1. Ensure `.env` exists:
   ```bash
   cp .env.example .env
   ```
2. Generate application key:
   ```bash
   php artisan key:generate
   ```
3. Check file permissions:
   ```bash
   chmod 644 .env
   ```

## Database Problems

### Connection Refused
**Symptoms**: `SQLSTATE[HY000] [2002] Connection refused`

**Solutions**:
1. Verify MySQL/MariaDB service is running:
   ```bash
   # On Linux
   sudo systemctl status mysql
   
   # On macOS with Homebrew
   brew services list | grep mysql
   
   # On Windows
   net start mysql
   ```
2. Check connection details in `.env`:
   ```
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_db_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```
3. Test connection manually:
   ```bash
   mysql -u your_username -p -h 127.0.0.1 -P 3306
   ```

### Database Does Not Exist
**Symptoms**: `SQLSTATE[HY000] [1049] Unknown database`

**Solutions**:
1. Create the database:
   ```sql
   CREATE DATABASE arbiter_coffee_hub;
   ```
2. Verify database name in `.env` matches what you created
3. Check for typos in database name

### Migration Failures
**Symptoms**: `php artisan migrate` fails

**Solutions**:
1. Check specific error message for clues
2. Common causes:
   - **Table already exists**: Drop and recreate database, or use `--force`
   - **Foreign key constraint fails**: Check referenced tables exist
   - **Column type mismatch**: Verify data types in migration
   - **Missing extension**: Ensure required PHP extensions are installed
3. Try running migrations with verbose output:
   ```bash
   php artisan migrate --verbose
   ```
4. For persistent issues, try fresh database:
   ```bash
   php artisan migrate:fresh
   ```

### Permission Denied on Storage
**Symptoms**: `The stream or file "/path/to/storage/logs/laravel.log" could not be opened: failed to open stream: Permission denied`

**Solutions**:
1. Set proper permissions:
   ```bash
   chmod -R 775 storage
   chmod -R 775 bootstrap/cache
   ```
2. Set ownership to web server user (adjust for your system):
   ```bash
   # Ubuntu/Debian
   sudo chown -R www-data:www-data storage bootstrap/cache
   
   # CentOS/RHEL
   sudo chown -R apache:apache storage bootstrap/cache
   
   # macOS with Homebrew PHP
   sudo chown -R _www:_www storage bootstrap/cache
   ```

## Configuration Issues

### Application Key Not Set
**Symptoms**: `EncryptionException` or session/cookie issues

**Solutions**:
1. Generate application key:
   ```bash
   php artisan key:generate
   ```
2. Verify `APP_KEY` is set in `.env`:
   ```
   APP_KEY=base64:your_generated_key_here
   ```

### Cache Issues
**Symptoms**: Stale data, configuration not updating

**Solutions**:
1. Clear application cache:
   ```bash
   php artisan cache:clear
   ```
2. Clear configuration cache:
   ```bash
   php artisan config:clear
   ```
3. Clear route cache:
   ```bash
   php artisan route:clear
   ```
4. Clear view cache:
   ```bash
   php artisan view:clear
   ```
5. Clear all caches:
   ```bash
   php artisan optimize:clear
   ```

### Environment Variables Not Loading
**Symptoms**: Application behaves as if env vars are empty

**Solutions**:
1. Check for typos in variable names
2. Ensure no spaces around `=` in `.env`:
   ```ini
   # Wrong
   DB_HOST = localhost
   
   # Correct
   DB_HOST=localhost
   ```
3. Check for invisible characters (especially if copied from web)
4. Run `php artisan config:cache` after changing `.env` (then clear if needed)
5. Verify file encoding is UTF-8 without BOM

## Backend Errors

### 500 Internal Server Error
**Symptoms**: Blank page or generic error message

**Solutions**:
1. Check Laravel logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```
2. Enable debug mode temporarily in `.env`:
   ```
   APP_DEBUG=true
   ```
3. Common causes:
   - **Undefined variable**: Check variable initialization
   - **Call to undefined method**: Verify method exists and is accessible
   - **Trying to access property on null**: Add null checks
   - **Database query errors**: Check SQL syntax and table/column names
   - **Missing dependencies**: Run `composer install`
   - **Compiled services cache**: Delete `bootstrap/cache/services.php`

### 403 Forbidden
**Symptoms**: Access denied to routes/resources

**Solutions**:
1. Check authentication status
2. Verify permissions using Spatie Laravel Permission:
   ```bash
   php artisan tinker
   >>> App\Models\User::find(1)->getPermissionNames();
   ```
3. Ensure middleware is applied correctly
4. Check gate/policy definitions
5. Verify user is authenticated:
   ```blade
   @auth
       // User is logged in
   @endauth
   ```

### 404 Not Found
**Symptoms**: Route or resource not found

**Solutions**:
1. Check route definitions in `routes/api.php` and `routes/web.php`
2. Verify URL spelling and case sensitivity
3. Check if route middleware is blocking access
4. Clear route cache:
   ```bash
   php artisan route:clear
   ```
5. For API routes, ensure you're using correct prefix (`/api/v1/`)

### Queue Worker Issues
**Symptoms**: Jobs not processing, workers dying

**Solutions**:
1. Check queue connection in `.env`:
   ```
   QUEUE_CONNECTION=database  # or redis, sync, etc.
   ```
2. Monitor failed jobs:
   ```bash
   php artisan queue:failed
   ```
3. Retry failed jobs:
   ```bash
   php artisan queue:retry all
   ```
4. Check worker logs:
   ```bash
   php artisan queue:work --verbose
   ```
5. Ensure database table for failed jobs exists:
   ```bash
   php artisan queue:table
   php artisan migrate
   ```

## Frontend Problems

### Blank White Screen
**Symptoms**: React app shows blank white page

**Solutions**:
1. Check browser console for errors (F12 -> Console)
2. Common causes:
   - **JavaScript syntax error**: Fix the syntax issue
   - **Missing dependency**: Install required npm package
   - **Invalid JSX**: Check component return statements
   - **Error in render()**: Look for null/undefined references
3. Check network tab for failed requests
4. Try clearing browser cache and hard reload (Ctrl+Shift+R)

### Module Not Found Errors
**Symptoms**: `Module not found: Can't resolve 'xxx'`

**Solutions**:
1. Install missing package:
   ```bash
   npm install package-name
   # or
   yarn add package-name
   ```
2. Check for typos in import statement
3. Verify package is in `package.json` dependencies
4. Try deleting `node_modules` and reinstalling:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
5. Check case sensitivity (especially on macOSXcritical).
          // ... other code
```javascript
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function UserProfile({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => axios.get(`/api/users/${userId}`).then(res => res.data),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data.name}</div>;
}
```
 Xcritical).</returns>
      
      // Example implementation that might cause a linting error
      componentDidMount() {
        // Fetch data when component mounts
      }
    };
    
    return (
      <div>
        <MyComponent />
      </div>
    );
  }
}

// Example of a component with useEffect cleanup
function DataFetchingComponent({ id }) {
  const [data, setData] = React.useState(null);
  
  React.useEffect(() => {
    let isMounted = true; // Cleanup flag
    
    fetchData(id).then(result => {
      if (isMounted) {
        setData(result);
      }
    });
    
    return () => {
      isMounted = false; // Cleanup function
    };
  }, [id]);
  
  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}