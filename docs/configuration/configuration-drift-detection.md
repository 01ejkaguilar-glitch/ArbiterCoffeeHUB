# Configuration Drift Detection Guide

This document provides guidance on detecting and preventing configuration drift between environments (local, testing, production).

## What is ition drift occurs when the configuration of two or more environments, leading to inconsistent behavior, unexpected errors, or security vulnerabilities. For example, if the production environment has different database credentials or feature flags enabled than the staging environment, tests performed in staging may not accurately reflect production behavior.

## Why Configuration Drift is a Problem

- **Inconsistent Behavior**: The application may behave differently in different environments, making it difficult to reproduce issues.
- **Deployment Risks**: Changes that work in staging may fail in production due to configuration differences.
- **Security Vulnerabilities**: Misconfigured security settings (e.g., debug mode enabled in production) can expose sensitive information.
- **Compliance Issues**: In regulated environments, configuration drift can lead to audit failures.

## Strategies for Preventing Configuration Drift

### 1. Infrastructure as Code (IaC)

Use tools like Terraform, AWS CloudFormation, or Azure Resource Manager to define and provision infrastructure and associated configuration in a declarative manner. This ensures that environments are provisioned identically.

### 2. Configuration as Code

Store configuration files in version control (excluding secrets). Use templating tools (e.g., envsubst, Helm, or custom scripts) to inject environment-specific values at deployment time.

### 3. Centralized Configuration Store

Use a centralized configuration service (e.g., AWS AppConfig, Azure App Configuration, Consul, or etcd) to manage configuration across environments. This ensures that all instances read from the same source of truth.

### 4. Environment Variables with Validation

Use environment variables for configuration (as the application does) and validate them at startup (as implemented via the EnvironmentValidationServiceProvider). Ensure that the same set of expected variables is defined in all environments.

### 5. Immutable Infrastructure

Adopt an immutable infrastructure pattern where servers are not modified after deployment. Instead, new instances are provisioned with the desired configuration, and old instances are replaced.

### 6. Configuration Monitoring and Alerting

Regularly scan configurations across environments and alert on discrepancies. This guide focuses on detection strategies.

## Detecting Configuration Drift

### 1. Environment Variable Comparison

Compare the set and values of environment variables across environments.

**Manual Approach**:
- List environment variables in each environment:
  ```bash
  # On each server, run:
  printenv | sort > env.txt
  ```
- Compare the files using `diff` or similar tools.

**Automated Approach**:
- Use a script to collect environment variables from all servers and report differences.
- Example (bash):
  ```bash
  #!/bin/bash
  # Collect env from multiple servers and compare
  SERVERS=("staging-app1" "staging-app2" "prod-app1" "prod-app2")
  for server in "${SERVERS[@]}"; do
    echo "=== $server ==="
    ssh "$server" "printenv | sort" > "/tmp/env_$server.txt"
  done
  diff -u /tmp/env_staging-app1.txt /tmp/env_prod-app1.txt
  ```

### 2. Configuration File Comparison

Compare application configuration files (excluding those that contain secrets) across environments.

**Note**: Laravel stores configuration in PHP arrays in the `config/` directory. These files should be identical across environments (except for values that are intentionally different, which should be set via environment variables).

**Manual Approach**:
- Copy the `config/` directory from each environment and compare using `diff -r`.

**Automated Approach**:
- Use a tool like `rsync` to compare directories and report differences.

### 3. Database Configuration Check

Ensure that database connection settings (host, port, database name, username) are consistent where they should be, and intentionally different where required (e.g., separate databases for staging and production).

**Approach**:
- Check the values of `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` in each environment.
- Confirm that staging and production use different database credentials.

### 4. Service Dependency Verification

Verify that external services (e.g., Redis, Memcached, third-party APIs) are correctly configured and that the application can connect to them.

**Approach**:
- Use health check endpoints or scripts to verify connectivity to each service from each environment.
- Compare the configuration used for these services.

### 5. Feature Flag Consistency

If using feature flags, ensure that flag definitions (name, description) are consistent across environments, and that only the enabled/disabled state varies as intended.

**Approach**:
- Compare the `feature_flags` table across environments (excluding the `enabled` column if intentional differences are expected).
- Verify that any conditions (e.g., percentage rollout) are appropriate for each environment.

### 6. Application Health and Metadata Endpoints

Implement an endpoint that returns the application's configuration (excluding secrets) and use it to compare across environments.

**Example**:
- Add a route that returns non-sensitive configuration:
  ```php
  Route::get('/debug/config', function () {
      $config = config()->all();
      // Remove sensitive keys
      unset($config['app']['key']);
      unset($config['database']['connections']['mysql']['password']);
      // ... remove other sensitive keys
      return response()->json($config);
  })->middleware(['auth', 'admin']); // Protect the endpoint
  ```
- Then, call this endpoint from each environment and compare the JSON outputs.

## Tools for Configuration Drift Detection

### Open Source Tools
- **diffutils**: Standard Unix tools for comparing files and directories.
- **vimdiff**: Visual diff tool for comparing files.
- **Meld**: GUI tool for comparing directories and files.
- **Ansible**: Can be used to collect and compare configuration facts.
- **Chef InSpec**: Compliance-as-code tool that can detect configuration drift.

### Commercial Tools
- **Figleaf**: Configuration drift detection and remediation.
- **CloudHealth by VMware**: Includes configuration drift detection for cloud environments.
- **Turbonomic**: Provides configuration and compliance monitoring.

### Cloud Provider Tools
- **AWS Config**: Tracks resource inventory and changes, can detect drift from desired configurations.
- **Azure Policy**: Enforces and assesses resource compliance, including configuration drift.
- **Google Cloud Asset Inventory**: Tracks resource changes over time.

## Recommended Approach for Arbiter Coffee Hub

Given the current architecture, we recommend the following lightweight approach:

1. **Environment Variable Validation**: Continue using the EnvironmentValidationServiceProvider to ensure all required variables are present and valid.

2. **Configuration Comparison Script**: Implement a simple script that:
   - SSHes into each environment (or uses the deployment mechanism to run commands)
   - Collects:
     - Environment variables (filtered to exclude sensitive ones)
     - Laravel configuration (via `php artisan config:cache` and then reading the cached files, or via `config()->all()` with filtering)
     - Key database connection settings
     - External service configurations (from config files)
   - Compares the collected data against a baseline (e.g., the production environment or a defined standard)
   - Reports any discrepancies

3. **Periodic Execution**: Run the script periodically (e.g., daily) via a cron job or CI pipeline, and alert on any drift.

4. **Documentation of Intentional Differences**: Maintain a document that lists configuration differences that are intentional and approved (e.g., different database names, different cache stores, different feature flag states). The drift detection script should exclude these known differences.

## Example Drift Detection Script

Below is a conceptual example of a bash script that could be used to detect configuration drift. This script would need to be adapted to the specific infrastructure and security constraints.

```bash
#!/bin/bash
# Configuration drift detection script for Arbiter Coffee Hub

# Define environments to check (add your actual server hosts or groups)
ENVS=("staging-web-01" "staging-web-02" "prod-web-01" "prod-web-02")
BASELINE="prod-web-01"  # Use one production instance as baseline

# Temporary directory for collecting configs
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Function to collect configuration from a server
collect_config() {
    local server=$1
    local outfile="$TMPDIR/$server.conf"
    
    echo "Collecting config from $server..."
    
    # Collect environment variables (excluding sensitive ones)
    ssh "$server" "printenv | grep -vE '^(APP_KEY|DB_PASSWORD|AWS_|PUSHER_|VAPID_|GCASH_|MAYA_|PAYPAL_|STRIPE_|MAIL_PASSWORD|SESSION_ENCRYPT|SESSION_DRIVER|SESSION_LIFETIME|SESSION_DOMAIN|SESSION_PATH|SESSION_ENCRYPT|SESSION_LIFETIME|SESSION_DOMAIN|SESSION_PATH|CACHE_STORE|QUEUE_CONNECTION|FILE_SYSTEM_DISK|CACHE_STORE|SESSION_DRIVER|SESSION_LIFETIME|SESSION_DOMAIN|SESSION_PATH|SESSION_ENCRYPT|SESSION_LIFETIME|SESSION_DOMAIN|SESSION_PATH|)'
} 

# Actually, we need a better way to filter. Let's collect all and then filter sensitive keys later.
    ssh "$server" "printenv" > "$TMPDIR/$server.env"
    
    # Collect Laravel configuration (non-sensitive parts)
    ssh "$server" "php artisan tinker --execute='echo json_encode(array_except(config()->all(), [\"app.key\", \"database.connections.mysql.password\", \"services.vapid.private_key\", \"services.pusher.app_secret\", \"services.paypal.client_secret\", \"services.stripe.secret\", \"services.gcash.api_key\", \"services.maya.secret_key\", \"services.paypal.client_secret\", \"mail.password\"]));'" | jq -S . > "$TMPDIR/$server.config.json"
    
    # Collect key configuration files (optional, if needed)
    # scp "$server:/path/to/app/config/app.php" "$TMPDIR/$server.app.php"
}

# Collect from all environments
for env in "${ENVS[@]}"; do
    collect_config "$env"
done

# Compare each environment to baseline
for env in "${ENVS[@]}"; do
    if [ "$env" != "$BASELINE" ]; then
        echo "=== Comparing $env to baseline $BASELINE ==="
        echo "--- Environment Variables ---"
        diff -u "$TMPDIR/$BASELINE.env" "$TMPDIR/$server.env" | grep -E '^[+-]' | grep -v '^+++' | grep -v '^---' || echo "No differences"
        
        echo "--- Laravel Configuration ---"
        diff -u "$TMPDIR/$BASELINE.config.json" "$TMPDIR/$server.config.json" | grep -E '^[+-]' | grep -v '^+++' | grep -v '^---' || echo "No differences"
    fi
done

echo "Drift detection complete."
```

Note: The above script is a starting point and would require refinement for production use, including:
- Proper handling of SSH keys and authentication
- Better filtering of sensitive environment variables
- Error handling and reporting
- Integration with alerting systems (e.g., email, Slack)
- Exclusion of known intentional differences

## Conclusion

Configuration drift is a significant risk to application reliability, security, and consistency. By implementing a combination of preventive measures (IaC, centralized configuration, immutable infrastructure) and detection strategies (regular comparison, validation, monitoring), the Arbiter Coffee Hub team can ensure that environments remain consistent and that any drift is quickly identified and addressed.

Regularly reviewing and updating this guide, along with the drift detection scripts and processes, will help maintain configuration integrity as the application and infrastructure evolve.

## Related Documentation

- [Environment Variables Reference](./environment-variables.md) - Comprehensive reference for all environment variables
- [Secret Management Solution](../security/secret-management.md) - Evaluation of secret management solutions for improved configuration security