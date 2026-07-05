# Database Performance & Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement database performance and optimization improvements identified in DATABASE_PERFORMANCE_FINDINGS.md to improve query performance, ensure proper indexing, and optimize database operations.

**Architecture:** Focus on fixing commented-out indexes, adding missing indexes based on query patterns, implementing query caching, and evaluating read replica configuration.

**Tech Stack:** Laravel 11, PHP 8.2+, MySQL, Composer

---

## Pre-Implementation Check

- [ ] Review DATABASE_PERFORMANCE_FINDINGS.md to understand all findings
- [ ] Check the current state of migration 2026_03_06_144423_add_performance_optimization_indexes.php
- [ ] Verify existing indexes from previous migrations
- [ ] Review query patterns in controllers to identify optimization opportunities
- [ ] Check current caching implementation in ProductController
- [ ] Review config/database.php for replica configuration

---

## Immediate Actions (0-30 days)

### Task 1: Investigate and Fix Commented Indexes

**Files:**
- Modify: `database/migrations/2026_03_06_144423_add_performance_optimization_indexes.php`

- [ ] **Step 1: Examine the migration file**
  - Review why indexes are commented out
  - Determine if indexes are beneficial and should be uncommented
  - Check if there were any issues that caused them to be commented

- [ ] **Step 2: Uncomment beneficial indexes**
  - Uncomment all index creation statements that would improve performance
  - Ensure proper syntax and formatting
  - Verify the migration will run without errors

- [ ] **Step 3: Re-run the migration**
  - Since the migration may have already run (but with no effect due to comments), we need to handle this properly
  - Option 1: Create a new migration to add the indexes
  - Option 2: Reset and re-run the migration (if appropriate for environment)
  - Option 3: Add the indexes directly via SQL if migration system is complex

- [ ] **Step 4: Verify indexes are created**
  - Check database schema to confirm indexes exist
  - Test that queries can utilize the new indexes

- [ ] **Step 5: Commit**
  ```bash
  git add database/migrations/2026_03_06_144423_add_performance_optimization_indexes.php
  git commit -m "database: uncomment and apply performance optimization indexes
  
  - Fixed commented-out indexes in migration 2026_03_06_144423
  - Added indexes for cart items, carts, shifts, tasks, employees, orders, leave requests
  - Improved query performance for common filtering and joining patterns"
  ```

### Task 2: Add Missing Indexes Based on Query Patterns

**Files:**
- Create: New migration file for additional indexes
- Modify: Existing migration files if needed

- [ ] **Step 1: Analyze query patterns in controllers**
  - Review controllers for frequent query patterns
  - Identify columns used in WHERE, JOIN, ORDER BY, GROUP BY clauses
  - Look for foreign key columns, status fields, date columns
  - Identify common filter combinations that would benefit from composite indexes

- [ ] **Step 2: Identify missing indexes**
  - Based on findings and code review, determine additional indexes needed
  - Focus on: foreign keys, status fields, date filters, common query combinations
  - Consider both single-column and composite indexes

- [ ] **Step 3: Create migration for missing indexes**
  - Generate new migration file with `php artisan make:migration`
  - Add index statements for identified missing indexes
  - Ensure proper indexing strategy (consider cardinality, selectivity)

- [ ] **Step 4: Run migration and verify**
  - Execute the migration
  - Confirm indexes are created in database
  - Test query performance with EXPLAIN statements

- [ ] **Step 5: Commit**
  ```bash
  git add database/migrations/
  git commit -m "database: add missing indexes based on query patterns
  
  - Added indexes for frequently queried columns
  - Improved performance for filtering, sorting, and joining operations
  - Based on analysis of controller query patterns"
  ```

### Task 3: Implement Query Caching

**Files:**
- Modify: Controllers to implement caching (ProductController, OrderController, CustomerInsightsController, etc.)
- Create: Cache service/helper if needed
- Modify: Cache configuration if needed

- [ ] **Step 1: Review existing caching pattern**
  - Examine ProductController's rememberProduct method and cache usage
  - Understand cache tags and invalidation strategy

- [ ] **Step 2: Identify expensive operations for caching**
  - Review controllers for frequently accessed, slowly changing data
  - Examples: categories, system configurations, reference data, reports
  - Focus on read-heavy operations with acceptable staleness

- [ ] **Step 3: Implement caching in controllers**
  - Apply similar pattern to ProductController in other controllers
  - Use Laravel's cache facade with remember() or rememberForever()
  - Implement appropriate cache keys and tags
  - Set reasonable TTL values based on data volatility

- [ ] **Step 4: Implement cache invalidation**
  - Ensure cache is cleared when underlying data changes
  - Use model events (saved, deleted) or manual cache clearing
  - Maintain consistency between cache and database

- [ ] **Step 5: Commit**
  ```bash
  git add app/Http/Controllers/Api/V1/
  git commit -m "performance: implement query caching in controllers
  
  - Extended caching pattern from ProductController to other controllers
  - Added caching for expensive operations and reference data
  - Implemented proper cache invalidation strategies
  - Used cache tags for selective cache clearing"
  ```

### Task 4: Evaluate Read Replica Configuration

**Files:**
- Modify: `config/database.php`
- Create: Documentation for replica setup
- Modify: Database connection usage if implementing

- [ ] **Step 1: Review current database configuration**
  - Examine config/database.php for existing connections
  - Check if replica configuration is already present
  - Understand environment-specific configuration

- [ ] **Step 2: Research read replica implementation**
  - Determine if current infrastructure supports read replicas
  - Identify benefits and complexity of implementation
  - Consider Laravel's built-in read/write connection separation

- [ ] **Step 3: Implement read replica configuration (if beneficial)**
  - Add replica connections to config/database.php
  - Configure read/write separation if appropriate
  - Update database queries to use replicas for read operations
  - Consider using Laravel's built-in functionality for this

- [ ] **Step 4: Create documentation**
  - Document replica setup process
  - Include monitoring and maintenance procedures
  - Note any application-level considerations

- [ ] **Step 5: Commit**
  ```bash
  git add config/database.php
  git commit -m "database: evaluate and configure read replica connections
  
  - Added read replica configuration to database settings
  - Configured read/write connection separation
  - Updated documentation for replica setup and usage
  - Prepared for distributing read load in production"
  ```

## Monitoring and Verification (Ongoing)

### Task 5: Implement Database Performance Monitoring

**Files:**
- Create: Monitoring scripts or configuration
- Modify: Logging configuration if needed
- Create: Documentation for monitoring procedures

- [ ] **Step 1: Enable slow query logging**
  - Configure MySQL slow query log via configuration or migration
  - Set appropriate thresholds for query execution time
  - Ensure logs are rotated and monitored

- [ ] **Step 2: Add query performance metrics**
  - Consider implementing query timing in application layer
  - Add logging for slow queries detected in code
  - Monitor index usage and effectiveness

- [ ] **Step 3: Create monitoring documentation**
  - Document procedures for checking slow query logs
  - Include EXPLAIN analysis techniques
  - Provide guidelines for index optimization based on monitoring

- [ ] **Step 4: Commit**
  ```bash
  git add config/database.php
  git add config/logging.php  # if modified
  git add docs/database/
  git commit -m "monitoring: add database performance monitoring
  
  - Enabled slow query logging for identifying problematic queries
  - Added query performance metrics and logging
  - Created documentation for monitoring and optimization procedures
  - Established baseline for ongoing performance tracking"
  ```

---

## Plan Summary

| Task | Description | Changes |
|------|-------------|---------|
| 1 | Investigate and Fix Commented Indexes | Migration file update, index creation |
| 2 | Add Missing Indexes Based on Query Patterns | New migration files |
| 3 | Implement Query Caching | Controller modifications, cache service |
| 4 | Evaluate Read Replica Configuration | Database config, documentation |
| 5 | Implement Database Performance Monitoring | Logging config, monitoring docs |

## Expected Outcome

After implementation:
- All intended performance optimization indexes are created and active
- Additional indexes based on query patterns improve common operations
- Query caching reduces database load for frequently accessed data
- Read replica configuration distributes read load in production
- Performance monitoring identifies and helps optimize slow queries
- Overall database performance is significantly improved
- Application scales better with increased data and user load

## Co-Authored-By
Claude Opus 4.8 (1M context) <noreply@anthropic.com>