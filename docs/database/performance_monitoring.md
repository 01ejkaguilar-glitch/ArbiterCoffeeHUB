# Database Performance Monitoring

## Overview

This document outlines the procedures for monitoring database performance in the Arbiter Coffee Hub application. Monitoring is crucial for identifying slow queries, optimizing database performance, and ensuring the application scales effectively.

## Application-Level Slow Query Logging

The application logs slow queries using Laravel's event system. Queries that exceed a configurable threshold are logged to the `performance` log channel.

### Configuration

The slow query threshold can be configured via the `.env` file:

```env
DB_SLOW_QUERY_THRESHOLD=100
```

The value is in milliseconds. The default is 100ms if not set.

### Log Location

Slow queries are logged to:
- `storage/logs/performance.log` (daily rotating)

### Log Format

Each slow query log entry includes:
- **query**: The SQL query string
- **bindings**: The parameter bindings for the query
- **time**: Execution time in milliseconds
- **connection**: The database connection used

Example log entry:
```
[2026-06-26 10:30:45] performance.WARNING: Slow query detected {
  "query": "SELECT * FROM orders WHERE user_id = ? AND status = ?",
  "bindings": [123, "pending"],
  "time": "245.67 ms",
  "connection": "mysql"
}
```

## Database-Level Slow Query Logging (MySQL)

For more comprehensive monitoring, you can enable MySQL's built-in slow query log. This captures all slow queries at the database level, including those not triggered by the application (e.g., direct database queries, replication events).

### Enabling Slow Query Log

To enable the slow query log, you need SUPER privileges. Add the following to your MySQL configuration file (`my.cnf` or `my.ini`):

```ini
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 1
log_queries_not_using_indexes
```

Then restart the MySQL server.

### Variables Explanation

- `slow_query_log`: Enables or disables the slow query log.
- `slow_query_log_file`: The file where slow queries are logged.
- `long_query_time`: The threshold (in seconds) for logging slow queries. Queries taking longer than this are logged.
- `log_queries_not_using_indexes`: Logs queries that do not use indexes (optional but recommended for performance tuning).

### Alternative: Setting Variables at Runtime

If you cannot restart the MySQL server, you can set these variables at runtime (requires SUPER privilege):

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';
SET GLOBAL long_query_time = 1;
SET GLOBAL log_queries_not_using_indexes = 'ON';
```

Note: Runtime settings are reset on MySQL restart.

## Monitoring Procedures

### Daily Checks

1. **Check the application performance log**:
   ```bash
   tail -n 50 storage/logs/performance.log
   ```
   Look for any slow queries and investigate their cause.

2. **Review query patterns**:
   - Identify queries that appear frequently in the slow log.
   - Check if these queries are using appropriate indexes (refer to the database migrations for index information).
   - Consider optimizing the query or adding indexes if necessary.

### Weekly Checks

1. **Analyze trends**:
   - Use log analysis tools to identify trends in slow query frequency.
   - Correlate with application deployments or traffic changes.

2. **Check MySQL slow query log** (if enabled):
   ```bash
   sudo tail -n 50 /var/log/mysql/slow-query.log
   ```

### Alerting

Consider setting up alerts based on the performance log. For example, you can use log monitoring tools to notify when:
- The number of slow queries exceeds a threshold in a time period.
- A particular query appears repeatedly in the slow log.

## Tools for Analysis

### EXPLAIN

Use the `EXPLAIN` statement to analyze query execution plans:
```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';
```

### MySQL Workbench / phpMyAdmin

These tools provide visual explain plans and performance dashboards.

### Laravel Debugbar

During development, Laravel Debugbar can show query counts and durations.

## Best Practices

1. **Index Appropriately**: Ensure that columns used in WHERE, JOIN, ORDER BY, and GROUP BY clauses are indexed.
2. **Avoid SELECT \***: Select only the columns you need.
3. **Use Pagination**: For large result sets, use pagination to reduce memory usage and improve response times.
4. **Cache Queries**: Use Laravel's caching for frequently accessed, slowly changing data.
5. **Regular Review**: Periodically review slow query logs and adjust indexes or queries as needed.

## Related Documentation

- [Database Indexing Strategy](./indexing-strategy.md) - Details on the indexing strategy implemented via migrations.
- [Read Replica Configuration](../database-read-replica.md) - Information on the read replica setup for distributing database load.
- [Query Caching](../query-caching.md) - Overview of query caching implementation in controllers.

## Troubleshooting

### High Number of Slow Queries

If you notice a sudden increase in slow queries:
1. Check for recent deployments that might have changed query patterns.
2. Verify that database indexes are present and not corrupted.
3. Check server resources (CPU, memory, disk I/O) for bottlenecks.

### Slow Query Log Not Recording

If you enabled the database-level slow query log but see no entries:
1. Verify the `long_query_time` setting is appropriate.
2. Ensure the MySQL user has permission to write to the log file.
3. Check the MySQL error log for any issues related to the slow query log.

## Conclusion

By combining application-level and database-level slow query logging, you gain comprehensive visibility into database performance. Regular monitoring and proactive optimization ensure that the application remains responsive and scalable as data and user load grow.

---
*Last updated: 2026-06-26*