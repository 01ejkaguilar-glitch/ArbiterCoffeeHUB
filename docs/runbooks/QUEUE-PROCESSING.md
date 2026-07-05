# QUEUE-PROCESSING.md

This document outlines the procedures for managing job queues in the Arbiter Coffee Hub system.

## Purpose
To ensure reliable background job processing by providing standardized procedures for monitoring, managing, and troubleshooting the queue system.

## Scope
This procedure applies to all queue connections and workers used in the Arbiter Coffee Hub application including database, Redis, and SQS queue connections.

## Responsibilities
- **DevOps Engineer**: Maintains queue infrastructure and monitoring
- **On-call Engineer**: Executes queue management procedures during incidents
- **Backend Developer**: Ensures queue jobs are properly implemented and monitored

## Prerequisites
- Access to application server with appropriate privileges
- Understanding of Laravel queue system
- Access to monitoring tools (Horizon, CloudWatch, etc.)
- Knowledge of queue configuration and job types

## Queue System Overview

### Queue Connections
The application uses multiple queue connections:
- **database**: For low-priority, non-time-sensitive jobs
- **redis**: For high-priority, time-sensitive jobs (default)
- **sqs**: For distributed processing in production environments

### Queue Workers
Multiple worker processes run to process jobs from queues:
- Default worker processes all queues
- Specialized workers for specific queue types (emails, reports, etc.)

## Queue Management Procedures

### Monitoring Queue Status
Check the status of all queues and workers:

```bash
# Using Laravel Artisan
php artisan queue:work --once --verbose

# Using Laravel Horizon (if installed)
php artisan horizon

# Check queue lengths
php artisan queue:listen --timeout=0
```

### Processing Queues Manually
Process queued jobs manually (useful for debugging):

```bash
# Process all queues
php artisan queue:work

# Process specific queue connection
php artisan queue:work redis

# Process specific queue
php artisan queue:work --queue=emails

# Process one job only
php artisan queue:work --once
```

### Restarting Queue Workers
Restart queue workers to pick up code changes:

```bash
# Graceful restart (waits for current jobs to finish)
php artisan queue:restart

# Force restart (immediately stops workers)
php artisan queue:restart --force
```

### Pausing/Resuming Queues
Temporarily pause queue processing:

```bash
# Pause queue processing
php artisan queue:pause

# Resume queue processing
php artisan queue:continue
```

### Failed Job Management
Handle failed jobs:

```bash
# List failed jobs
php artisan queue:failed

# Retry a specific failed job
php artisan queue:retry {id}

# Retry all failed jobs
php artisan queue:retry all

# Delete a specific failed job
php artisan queue:forget {id}

# Delete all failed jobs
php artisan queue:flush
```

### Queue Configuration
Modify queue configuration as needed:

```bash
# Clear application cache after queue config changes
php artisan config:clear

# View current queue configuration
php artisan config:view queue
```

## Validation Procedures

### Queue Validation Checklist
- [ ] Queue workers are running and processing jobs
- [ ] Failed job count is within acceptable limits
- [ ] Job processing times are within expected ranges
- [ ] No job processing errors in application logs
- [ ] Critical background jobs (emails, reports) are completing successfully
- [ ] Queue lengths are stable and not continuously growing

## Monitoring and Alerting

### Queue Monitoring
- **Job Processing Rate Alert**: Alert if job processing rate drops significantly
- **Failed Job Rate Alert**: Alert if failed job percentage exceeds threshold
- **Queue Depth Alert**: Alert if queue depth exceeds acceptable levels
- **Worker Status Alert**: Alert if expected number of workers are not running
- **Processing Time Alert**: Alert if average job processing time exceeds threshold

### Key Metrics to Monitor
- Jobs processed per minute
- Average job processing time
- Failed job count and rate
- Queue depth (number of waiting jobs)
- Worker memory and CPU utilization
- Longest running job duration

## Troubleshooting

### Common Queue Issues
1. **Workers Not Processing Jobs**
   - Check if queue workers are running: `ps aux | grep queue:work`
   - Verify queue connection configuration in `.env`
   - Check for failed workers in supervisor/process manager
   - Examine logs for connection errors

2. **Jobs Failing Repeatedly**
   - Examine failed job details: `php artisan queue:failed`
   - Check job code for exceptions
   - Verify external service dependencies (email, APIs, etc.)
   - Increase job timeout if needed
   - Check queue connection health

3. **Queue Backlog Growing**
   - Verify sufficient worker processes are running
   - Check for long-running jobs blocking queues
   - Examine job processing times for performance issues
   - Consider scaling worker count horizontally
   - Check for queue connection issues

4. **Memory Leaks in Workers**
   - Monitor worker memory usage over time
   - Implement worker restart based on memory usage
   - Check for unbounded data accumulation in jobs
   - Ensure proper object destruction in job classes
   - Consider using `queue:restart` with memory limits

## Related Documents
- [Application Architecture](../architecture/ARCHITECTURE-OVERVIEW.md)
- [Deployment Guide](../deployment/DEPLOYMENT-GUIDE.md)
- [Monitoring Guide](../monitoring/MONITORING-GUIDE.md)
- [Runbook Index](../RUNBOOK-INDEX.md)

## Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-01 | Platform Team | Initial version |
| 1.1 | 2026-06-15 | DevOps Team | Added Horizon integration |
| 1.2 | 2026-06-20 | Platform Team | Updated failed job procedures |
| 1.3 | 2026-06-25 | Backend Team | Added monitoring guidelines |

## Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Engineer | [Name] | [Signature] | [Date] |
| Engineering Manager | [Name] | [Signature] | [Date] |
| Security Officer | [Name] | [Signature] | [Date] |