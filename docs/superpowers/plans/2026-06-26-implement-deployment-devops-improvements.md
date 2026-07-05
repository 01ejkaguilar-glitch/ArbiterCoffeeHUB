# Deployment & DevOps Practices Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve deployment and DevOps practices based on DEPLOYMENT_DEVOPS_PRACTICES_FINDINGS.md to enhance CI/CD pipeline reliability, add automated testing, implement rollback capabilities, improve monitoring, and establish better deployment strategies.

**Tech Stack:** GitHub Actions, PHP/Laravel, React/Jest, FTP/SSH deployment

---

## Pre-Implementation Check

- [ ] Review DEPLOYMENT_DEVOPS_PRACTICES_FINDINGS.md to understand all findings
- [ ] Check current state of `.github/workflows/deploy.yml`
- [ ] Review existing testing setup (PHPUnit and Jest)
- [ ] Check current deployment process (FTP transfer, SSH commands)
- [ ] Review environment configuration and secrets

---

## Immediate Actions (0-30 days)

### Task 1: Add Automated Frontend Testing to Pipeline

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add frontend testing stage**
  - Add Jest testing step after frontend build
  - Ensure tests must pass before continuing to deployment
  - Use `react-scripts test` with appropriate flags for CI

- [ ] **Step 2: Ensure backend testing is required**
  - Verify PHPUnit testing step is correctly placed
  - Add explicit failure handling if needed

- [ ] **Step 3: Test the pipeline**
  - Commit changes and verify testing stages run
  - Confirm failing tests block deployment

### Task 2: Implement Basic Rollback Mechanism

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: Deployment directory structure on server

- [ ] **Step 1: Modify deployment strategy**
  - Instead of using timestamped releases
  - Keep N previous releases
  - Symlink-based approach for zero-downtime

- [ ] **Step 2: Add rollback capability**
  - manual rollback trigger via workflow_dispatch
  - automated rollback on health check failure (optional)

- [ ] **Step 3: Update SSH deployment commands**
  - Implement release directory structure
  - Update symlinks after successful deployment
  - Add cleanup of old releases

### Task 3: Add Deployment Notifications

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add notification steps**
  - Slack and/or email notifications
  - Notify on deployment start, success, and failure
  - Include deployment metadata (commit, version, timestamp)

- [ ] **Step 2: Configure notification secrets**
  - Document required secrets (SLACK_WEBHOOK_URL, etc.)

### Task 4: Improve Database Migration Safety

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: Pre-migration backup script (optional)

- [ ] **Step 1: Remove --force flag from migrations**
  - Let migrations fail safely to stop deployment on error
  - or implement pre-migration backup/check

- [ ] **Step 2: Add pre-migration backup**
  - Optional: Create database backup before migrations
  - Store backup with timestamp for potential rollback

### Task 5: Add Release Tagging and Versioning

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add Git tagging step**
  - Create timestamp-based or commit-based tags
  - Push tags to repository

- [ ] **Step 2: Add version information to deployment**
  - Include tag/commit in notifications
  - Optionally store version file in deployment

### Task 6: Enhance Deployment Monitoring and Health Checks

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Improve health checks**
  - Add API endpoint verification
  - Check queue workers if applicable
  - Verify critical functionality

- [ ] **Step 2: Add failure detection and alerts**
  - Enhance existing SSH health check script
  - Add explicit success/failure detection
  - Trigger notifications based on outcome

### Task 7: Evaluate Zero-Downtime Deployment Strategy

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: Deployment scripts if needed

- [ ] **Step 1: Research zero-downtime options for FTP**
  - symlink-based deployment (most feasible with current setup)
  - blue/green if infrastructure allows

- [ ] **Step 2: Implement symlink-based deployment**
  - releases/{timestamp} directory structure
  - current symlink pointing to latest release
  - Atomic symlink switch for zero-downtime

---

## Enhancements (30-60 days)

### Task 8: Add Environment Promotion Stages

**Files:**
- Modify: `.github/workflows/deploy.yml` (create multiple workflows or add environment input)
- Create: Staging environment configuration

- [ ] **Step 1: Implement multi-environment pipeline**
  - dev → staging → production
  - Require manual approval for production
  - Separate backend/frontend configuration per environment

### Task 9: Implement Infrastructure as Code Evaluation

**Files:**
- Create: IaC configuration files (Terraform/Ansible)
- Modify: Documentation

- [ ] **Step 1: Evaluate IaC solutions**
  - Terraform for provisioning
  - Ansible for configuration management
  - Start with documenting current server setup

### Task 10: Add Performance Benchmarking in CI

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add performance testing stage**
  - Benchmark critical API endpoints
  - Alert on performance degradation
  - Consider using tools like artillery or k6

---

## Monitoring and Verification (Ongoing)

### Task 11: Implement Deployment Success Metrics Tracking

**Files:**
- Create: Deployment tracking/logging if needed

- [ ] **Step 1: Track deployment metrics**
  - Deployment frequency
  - Success rate
  - Mean time to recovery
  - Change fail percentage

### Task 12: Create Deployment Runbook

**Files:**
- Create: DEPLOYMENT_RUNBOOK.md

- [ ] **Step 1 document procedures**
  - Standard deployment process
  - Rollback procedures
  - Emergency procedures
  - Troubleshooting guide

---

## Plan Summary

| Task | Description | Changes |
|------|-------------|---------|
| 1 | Add Automated Frontend Testing | Workflow modification |
| 2 | Implement Rollback Mechanism | Workflow modification, directory structure |
| 3 | Add Deployment Notifications | Workflow modification |
| 4 | Improve Database Migration Safety | Workflow modification |
| 5 | Add Release Tagging | Workflow modification |
| 6 | Enhance Monitoring/Health Checks | Workflow modification |
| 7 | Evaluate Zero-Downtime Deployment | Workflow modification |
| 8 | Add Environment Promotion | Workflow modification, possible new workflows |
| 9 | Implement IaC Evaluation | Documentation, possible new files |
| 10 | Add Performance Benchmarking | Workflow modification |
| 11 | Track Deployment Metrics | Documentation |
| 12 | Create Deployment Runbook | Documentation |

## Expected Outcome

After implementation:
- CI/CD pipeline includes comprehensive automated testing (backend and frontend)
- Deployment process has rollback capabilities
- Teams receive notifications on deployment status
- Database migrations run with improved safety
- Releases are tagged and versioned
- Monitoring and health checks are enhanced
- Foundation for zero-downtime deployment established
- Path cleared for environment promotion and IaC adoption

## Co-Authored-By
Claude Opus 4.8 (1M context) <noreply@anthropic.com>