# Backup & Disaster Recovery Runbook

## Overview
This document outlines procedures for backing up and recovering the Arbiter Coffee Hub application.

## Backup Procedures

### Automated Backups
The system performs automated backups according to the following schedule:

1. **Database Backups**: Daily at 2:00 AM
   - Full database dump using mysqldump
   - Retained for 30 days
   - Stored in: backups/database/

2. **File Backups**: Daily at 2:30 AM
   - Includes: storage/app (user uploads), storage/logs, config, resources/views, routes
   - Retained for 60 days
   - Stored in: backups/files/

3. **Backup Cleanup**: 
   - Database backups: Daily at 3:00 AM (removes >30 days old)
   - File backups: Daily at 3:30 AM (removes >60 days old)

4. **Verification**:
   - Weekly backup list: Mondays at 4:00 AM
   - Monthly full backup test: First day of month at 5:00 AM

### Manual Backup Commands

#### Database:
```bash
php artisan backup:database
```

#### Options:
- `--destination=LOCAL` - Specify backup disk (local, s3, etc.)
- `--compress` - Compress the backup file
- `--temp-dir=/path/to/temp` - Specify temporary directory
- `--only-files` - Backup only files (skip database)

#### Examples:
```bash
# Backup database only
php artisan backup:database

# Backup database with compression
php artisan backup:database --compress

# Backup files only
php artisan backup:database --only-files

# Backup files with compression to S3
php artisan backup:database --only-files --compress --destination=s3
```

#### Cleanup Old Backups:
```bash
php artisan backup:clean --type=database --days=30
php artisan backup:clean --type=files --days=60
php artisan backup:clean --type=all --days=30
```

## Recovery Procedures

### Database Recovery
1. Locate the desired backup file in `backups/database/`
2. Copy the backup file to a temporary location
3. If compressed, decompress: `gunzip backup-file.sql.gz`
4. Restore using: `mysql -u [username] -p [database_name] < backup-file.sql`
5. Verify the restoration by checking table counts and sample data

### File Recovery
1. Locate the desired backup file in `backups/files/`
2. Copy the backup file to a temporary location
3. If compressed, decompress: `gunzip backup-file.tar.gz`
4. Extract the archive: `tar -xf backup-file.tar`
5. Copy the extracted files to their original locations:
   - storage/app/* → storage/app/
   - storage/logs/* → storage/logs/
   - config/* → config/
   - resources/views/* → resources/views/
   - routes/* → routes/

### Point-in-Time Recovery Considerations
For point-in-time recovery, the following would be required:
1. Enable MySQL binary logging (requires server administrator access)
2. Configure binary log retention policies
3. Use mysqlbinlog to replay transactions since last full backup
4. Test recovery procedures regularly

## Monitoring and Verification

### Backup Success Indicators
- Artisan command returns exit code 0
- Log messages indicating successful backup creation
- Backup files appear in the designated storage location
- File sizes are reasonable (not zero bytes)

### Backup Failure Indicators
- Artisan command returns non-zero exit code
- Error messages in the command output
- Missing or zero-byte backup files
- Failed backup notifications (when implemented)

### Regular Verification
1. Weekly: Check that backup logs show successful completion
2. Monthly: Attempt restoration of a recent backup to a test environment
3. Quarterly: Perform full disaster recovery drill
4. Annually: Review and update recovery procedures

## Retention Policy
- Database backups: 30 days
- File backups: 60 days
- Monthly archives: 12 months (optional extension)

## Responsibilities
- System Administrator: Monitor backup success/failure reports
- Developers: Ensure backup procedures work with application changes
- Management: Review disaster recovery readiness quarterly

## Contact Information
For backup and recovery issues, contact the system administrator.

---
*Last updated: 2026-06-26*