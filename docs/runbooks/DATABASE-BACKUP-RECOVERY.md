# Database Backup and Recovery Runbook

This document outlines the procedures for backing up and restoring the Arbiter Coffee Hub database.

## Purpose
To ensure data integrity and availability by providing standardized procedures for database backup and recovery operations.

## Scope
This procedure applies to the primary production database for Arbiter Coffee Hub.

## Responsibilities
- **Database Administrator (DBA)**: Executes backup and recovery procedures
- **DevOps Engineer**: Maintains backup infrastructure and monitoring
- **Engineering Lead**: Approves recovery procedures during incidents
- **On-call Engineer**: Executes emergency recovery procedures

## Prerequisites
- Access to database server with appropriate privileges
- Sufficient disk space for backup files (minimum 2x database size)
- Backup storage location configured and accessible
- Monitoring tools configured to alert on backup failures

## Backup Procedures

### Regular Backups

#### Daily Full Backups
1. **Schedule**: Every day at 02:00 AM UTC
2. **Retention**: Keep daily backups for 30 days
3. **Command**:
   ```bash
   # Using mysqldump
   mysqldump -u backup_user -p --single-transaction --quick --lock-tables=false \
     arbiter_coffee_hub > /backups/daily/arbiter_coffee_hub_$(date +%Y%m%d_%H%M%S).sql
   
   # Compress the backup
   gzip /backups/daily/arbiter_coffee_hub_$(date +%Y%m%d_%H%M%S).sql
   
   # Verify backup
   gunzip -c /backups/daily/arbiter_coffee_hub_$(date +%Y%m%d_%H%M%S).sql.gz | head -5
   ```

#### Weekly Full Backups
1. **Schedule**: Every Sunday at 01:00 AM UTC
2. **Retention**: Keep weekly backups for 12 weeks
3. **Same as daily backup but stored in weekly directory**

#### Monthly Full Backups
1. **Schedule**: First day of each month at 00:00 AM UTC
2. **Retention**: Keep monthly backups for 12 months
3. **Same as daily backup but stored in monthly directory**

### Transaction Log Backups
1. **Schedule**: Every 15 minutes
2. **Retention**: Keep for 48 hours
3. **Purpose**: Enables point-in-time recovery
4. **Configuration**: Set up in MySQL binary logging or use replication

### Backup Verification
1. **Automated Checks**:
   - Backup file size validation (> 0 bytes)
   - Header verification (contains expected database name)
   - Row count sampling for critical tables
2. **Manual Verification** (Weekly):
   - Restore latest backup to test environment
   - Verify application connectivity
   - Check data integrity for key business entities

## Recovery Procedures

### Point-in-Time Recovery
1. **Identify Recovery Point**:
   - Determine exact time of data loss/corruption
   - Check binary logs for relevant timeframe
2. **Restore Latest Full Backup**:
   ```bash
   # Restore most recent full backup
   gunzip -c /backups/daily/arbiter_coffee_hub_$(date -d 'yesterday' +%Y%m%d)*.sql.gz | \
   mysql -u root -p arbiter_coffee_hub
   ```
3. **Apply Transaction Logs**:
   ```bash
   # Apply binary logs from backup time to recovery point
   mysqlbinlog --start-datetime="2026-06-15 02:00:00" --stop-datetime="2026-06-15 14:30:00" \
     /var/log/mysql/mysql-bin.000001 | mysql -u root -p arbiter_coffee_hub
   ```
4. **Verify Data Integrity**:
   - Run application health checks
   - Verify critical business data
   - Confirm application functionality

### Disaster Recovery (Complete Database Loss)
1. **Provision New Database Server** (if needed):
   - Provision new server with same specifications
   - Install MySQL version matching production
   - Configure network and security settings
2. **Restore Latest Backup**:
   ```bash
   # Get most recent backup from off-site storage
   aws s3 cp s3://company-backups/prod/db/arbiter_coffee_hub_latest.sql.gz .
   
   # Restore database
   gunzip -c arbiter_coffee_hub_latest.sql.gz | mysql -u root -p arbiter_coffee_hub
   ```
3. **Apply Transaction Logs Since Last Backup**:
   - Retrieve and apply all archived binary logs since backup time
   - Use point-in-time recovery procedures above
4. **Update Application Configuration**:
   - Ensure application points to new database host
   - Update connection strings if necessary
5. **Validate System**:
   - Run smoke tests against critical user journeys
   - Verify integration points (payment gateway, email service, etc.)
   - Confirm backup processes are re-established

## Validation Procedures

### Backup Validation Checklist
- [ ] Backup file created successfully
- [ ] Backup file size within expected range
- [ ] Backup contains expected database schema
- [ ] Sample data verification passes
- [ ] Backup stored in correct location/bucket
- [ ] Backup metadata recorded (timestamp, size, checksum)
- [ ] Alerting system notified of successful backup

### Recovery Validation Checklist
- [ ] Service availability restored
- [ ] Data consistency verified (checksums, record counts)
- [ ] Application functionality validated
- [ ] Performance baseline reestablished
- [ ] Monitoring and alerts restored
- [ ] Backup procedures re-enabled

## Monitoring and Alerting

### Backup Monitoring
- **Success Alert**: Notification when backup completes successfully
- **Failure Alert**: Immediate alert if backup fails
- **Duration Alert**: Warning if backup exceeds expected time threshold
- **Size Alert**: Warning if backup size deviates significantly from norm

### Recovery Testing
- **Monthly**: Test restore procedure in staging environment
- **Quarterly**: Full disaster recovery drill
- **Annually**: Business continuity plan validation

## Troubleshooting

### Common Backup Issues
1. **Insufficient Disk Space**
   - Check available space: `df -h`
   - Clean temporary files or expand storage
   - Consider incremental backups to reduce size

2. **Permission Errors**
   - Verify backup user has required privileges:
     ```sql
     SHOW GRANTS FOR 'backup_user'@'localhost';
     ```
   - Ensure file system permissions allow writing to backup directory

3. **Network Timeouts** (for remote backups)
   - Increase timeout values in backup scripts
   - Check network connectivity and bandwidth
   - Consider compressing data in transit

4. **Database Lock Issues**
   - Use `--single-transaction` flag for InnoDB tables
   - Schedule backups during low-activity periods
   - Consider using database snapshots (LVM, ZFS, or cloud snapshots)

### Common Recovery Issues
1. **Missing Binary Logs**
   - Ensure binary logging is properly configured
   - Check expiration settings don't remove needed logs
   - Consider archiving binary logs to separate storage

2. **Incompatible MySQL Versions**
   - Verify source and target MySQL versions are compatible
   - Use `mysql_upgrade` if necessary after version change
   - Consult MySQL upgrade documentation for version jumps

3. **Corrupted Backup Files**
   - Verify backup integrity immediately after creation
   - Store multiple copies in different locations
   - Consider using checksums or cryptographic hashes for validation

## Related Documents
- [Database Architecture](../architecture/DATABASE-ARCHITECTURE.md)
- [Disaster Recovery Plan](../disaster-recovery/DR-PLAN.md)
- [Backup Infrastructure](../infrastructure/BACKUP-INFRASTRUCTURE.md)
- [Runbook Index](../RUNBOOK-INDEX.md)

## Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-01 | Platform Team | Initial version |
| 1.1 | 2026-06-15 | DB Team | Added verification steps |
| 1.2 | 2026-06-20 | DevOps | Updated for cloud storage integration |

## Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Database Administrator | [Name] | [Signature] | [Date] |
| Engineering Manager | [Name] | [Signature] | [Date] |
| Security Officer | [Name] | [Signature] | [Date] |