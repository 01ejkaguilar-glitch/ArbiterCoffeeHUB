# SCALING-PROCEDURES.md

This document outlines the procedures for scaling the Arbiter Coffee Hub application up or down based on demand.

## Purpose
To ensure optimal performance and cost efficiency by providing standardized procedures for scaling application resources in response to changing demand patterns.

## Scope
This procedure applies to all scalable components of the Arbiter Coffee Hub infrastructure including web servers, application servers, database servers, cache servers, and queue workers.

## Responsibilities
- **DevOps Engineer**: Maintains scaling procedures and automation scripts
- **On-call Engineer**: Executes scaling procedures during traffic events
- **Platform Engineer**: Designs and implements scalable architectures
- **Engineering Lead**: Approves major scaling decisions and capacity planning

## Prerequisites
- Access to cloud infrastructure management console
- Understanding of application architecture and scaling patterns
- Access to monitoring and alerting systems
- Knowledge of current resource utilization and performance baselines
- Familiarity with auto-scaling groups and load balancers

## Scaling Strategies

### Horizontal Scaling (Preferred)
Adding/removing instances to distribute load:
- **Web Tier**: Scale EC2 instances behind load balancer
- **Application Tier**: Scale PHP-FPM workers or application containers
- **Database Tier**: Add read replicas for read-heavy workloads
- **Cache Tier**: Add Redis cluster nodes for distributed caching
- **Queue Tier**: Scale worker processes based on queue depth

### Vertical Scaling
Increasing/decreasing resources of existing instances:
- **Compute**: Increase/decrease CPU and RAM allocation
- **Storage**: Increase/decrease disk space and IOPS
- **Network**: Increase/decrease network bandwidth

### Database Scaling
Specific procedures for database scaling:
- **Read Replicas**: Add/remove MySQL read replicas
- **Connection Pooling**: Adjust database connection pool sizes
- **Query Optimization**: Optimize slow queries before scaling up
- **Partitioning**: Implement table partitioning for large tables

## Scaling Procedures

### Pre-Scaling Checklist
Before initiating any scaling operation:
- [ ] Review current performance metrics and trends
- [ ] Check for any ongoing incidents or deployments
- [ ] Verify monitoring alerts are configured correctly
- [ ] Confirm runbook procedures are up to date
- [ ] Notify stakeholders of planned scaling activity
- [ ] Ensure rollback procedures are documented and tested

### Scaling Up Procedures

#### Web/Application Tier Scaling
1. **Assess Need**: Verify CPU > 70% sustained, memory > 80%, or response time > 2s
2. **Increase Instances**: Add instances to auto-scaling group
   ```bash
   # Example AWS CLI
   aws autoscaling update-auto-scaling-group \
     --auto-scaling-group-name arbiter-coffee-web-asg \
     --desired-capacity 4 --min-size 2 --max-size 8
   ```
3. **Monitor**: Watch for improved performance metrics
4. **Stabilize**: Allow 5-10 minutes for new instances to warm up

#### Database Scaling (Read Replicas)
1. **Assess Need**: Verify read CPU > 60% or replication lag > 5s
2. **Create Read Replica**:
   ```bash
   # Example AWS CLI
   aws rds create-db-instance-read-replica \
     --db-instance-identifier arbiter-coffee-db-replica-1 \
     --source-db-instance-identifier arbiter-coffee-db-primary
   ```
3. **Update Application**: Configure application to use read replica for read queries
4. **Monitor**: Verify replication lag is minimal

#### Cache Scaling (Redis Cluster)
1. **Assess Need**: Verify memory usage > 80% or eviction rate > 0
2. **Add Cluster Node**:
   ```bash
   # Example using redis-cli
   redis-trib.rb add-node --slave --master-id <master-id> \
     <new-node-ip>:6379 <existing-node-ip>:6379
   ```
3. **Rebalance Slots**: 
   ```bash
   redis-trib.rb reshard <node-ip>:6379
   ```
4. **Verify**: Check cluster health and memory distribution

#### Queue Worker Scaling
1. **Assess Need**: Verify queue depth > 100 jobs or processing delay > 30s
2. **Increase Workers**: Scale worker auto-scaling group
   ```bash
   # Example AWS CLI
   aws autoscaling update-auto-scaling-group \
     --auto-scaling-group-name arbiter-coffee-workers-asg \
     --desired-capacity 6 --min-size 3 --max-size 12
   ```
3. **Monitor**: Verify queue depth decreases and processing time improves

### Scaling Down Procedures
Scale down procedures should be more conservative to avoid performance impact:

1. **Assess Need for Scale Down**: Verify sustained low utilization
   - CPU < 30% for 15+ minutes
   - Memory < 40% for 15+ minutes  
   - Queue depth < 10 jobs for 10+ minutes
   - Response time < 500ms for 15+ minutes

2. **Gradual Reduction**: Remove instances one at a time with monitoring between each removal

3. **Drain Connections**: Ensure existing connections are completed before termination

4. **Monitor Performance**: Watch for degradation after each removal

### Auto-Scaling Configuration
Configure auto-scaling policies based on metrics:

#### CPU-Based Scaling
```json
{
  "AdjustmentType": "ChangeInCapacity",
  "AutoScalingGroupName": "arbiter-coffee-web-asg",
  "Cooldown": 300,
  "MetricAggregationType": "Average",
  "MinAdjustmentMagnitude": 1,
  "PolicyType": "SimpleScaling",
  "ScalingAdjustment": 1,
  "StepAdjustments": [
    {
      "MetricIntervalLowerBound": 0,
      "MetricIntervalUpperBound": 30,
      "ScalingAdjustment": -1
    },
    {
      "MetricIntervalLowerBound": 70,
      "ScalingAdjustment": 1
    }
  ]
}
```

#### Queue Depth-Based Scaling
```json
{
  "AdjustmentType": "ChangeInCapacity",
  "AutoScalingGroupName": "arbiter-coffee-workers-asg",
  "Cooldown": 120,
  "MetricAggregationType": "Average",
  "MinAdjustmentMagnitude": 1,
  "PolicyType": "StepScaling",
  "StepAdjustments": [
    {
      "MetricIntervalLowerBound": 0,
      "MetricIntervalUpperBound": 20,
      "ScalingAdjustment": -1
    },
    {
      "MetricIntervalLowerBound": 50,
      "ScalingAdjustment": 1
    },
    {
      "MetricIntervalLowerBound": 100,
      "ScalingAdjustment": 2
    }
  ]
}
```

## Validation Procedures

### Scaling Validation Checklist
- [ ] Performance metrics improve or stabilize after scaling
- [ ] Error rates remain within acceptable thresholds
- [ ] Resource utilization is balanced across instances
- [ ] Application functionality remains intact
- [ ] Monitoring shows expected behavior patterns
- [ ] Cost impact is within budget expectations

### Post-Scaling Monitoring
Monitor for 30 minutes after scaling operations:
- Response times (50th, 95th, 99th percentiles)
- Error rates (5xx, 4xx)
- Resource utilization (CPU, memory, disk, network)
- Application-specific metrics (checkout rate, login success)
- Infrastructure health (load balancer health checks, instance status)

## Monitoring and Alerting

### Scaling-Related Alerts
- **Scale Out Trigger Alert**: Notification when auto-scaling group initiates scale out
- **Scale In Trigger Alert**: Notification when auto-scaling group initiates scale in
- **Instance Health Alert**: Alert if scaled instances fail health checks
- **Scaling Activity Alert**: Alert for any manual or automatic scaling operations
- **Resource Exhaustion Alert**: Alert if resources approach limits despite scaling

### Key Scaling Metrics
- Number of instances in each tier
- Average CPU utilization per tier
- Average memory utilization per tier
- Request rate and response time
- Queue depth and processing latency
- Cache hit rate and memory utilization
- Database connection count and query performance

## Troubleshooting

### Common Scaling Issues
1. **Performance Doesn't Improve After Scaling Out**
   - Check for application-level bottlenecks (database locks, inefficient algorithms)
   - Verify load balancer is distributing traffic evenly
   - Look for shared resource constraints (database connections, file locks)
   - Examine application logs for errors in new instances

2. **Instances Failing Health Checks After Scale Out**
   - Verify launch configuration/user data scripts
   - Check security group and network configurations
   - Examine instance logs for startup errors
   - Confirm required services are running (web server, PHP-FPM, etc.)

3. **Cost Overruns from Excessive Scaling**
   - Review scaling policies for overly aggressive thresholds
   - Implement scheduled scaling for predictable patterns
   - Consider reserved instances for baseline capacity
   - Set maximum instance limits in auto-scaling groups

4. **Database Replication Lag After Adding Read Replica**
   - Check network connectivity between primary and replica
   - Verify replica has sufficient resources
   - Examine MySQL error logs for replication issues
   - Consider adjusting replica thread configuration

5. **Cache Consistency Issues After Scaling**
   - Verify cache invalidation strategies work across cluster
   - Check for cache stampede during scaling events
   - Ensure consistent hashing is properly configured
   - Monitor cache hit rates on new nodes

## Related Documents
- [Application Architecture](../architecture/ARCHITECTURE-OVERVIEW.md)
- [Deployment Guide](../deployment/DEPLOYMENT-GUIDE.md)
- [Monitoring Guide](../monitoring/MONITORING-GUIDE.md)
- [Cost Optimization](../finance/COST-OPTIMIZATION-GUIDE.md)
- [Runbook Index](../RUNBOOK-INDEX.md)

## Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-01 | Platform Team | Initial version |
| 1.1 | 2026-06-10 | DevOps Team | Added auto-scaling policy examples |
| 1.2 | 2026-06-15 | Platform Team | Updated database scaling procedures |
| 1.3 | 2026-06-20 | Platform Team | Added cache scaling procedures |
| 1.4 | 2026-06-25 | Platform Team | Enhanced troubleshooting section |

## Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Platform Engineer | [Name] | [Signature] | [Date] |
| Engineering Manager | [Name] | [Signature] | [Date] |
| FinOps Lead | [Name] | [Signature] | [Date] |