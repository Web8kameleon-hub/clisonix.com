# PostgreSQL Connection Pool Optimization Guide

## Overview

This deployment addresses the critical PostgreSQL bottleneck (201% CPU) through intelligent connection pooling and query optimization. The solution implements a TypeScript-based load balancer on port 3338 that manages database connections efficiently while providing real-time analytics.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         Client Applications                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Port 3338: TypeScript Connection Pool Balancer             │
│  ├─ Query Complexity Analyzer                               │
│  ├─ Connection Pool Manager (5-20 connections)              │
│  └─ Load Balancer & Routing Logic                           │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    Fast Queries  Medium      Complex
         │      Queries      Queries
         ▼           ▼           ▼
    Primary DB  Read Replica  Queue
         └───────────┴───────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │ PostgreSQL 16 (5432)         │
        │ - Connection Pool: 5-20      │
        │ - Statement Timeout: 30s     │
        │ - Idle Timeout: 30s          │
        └──────────────────────────────┘
```

## Components

### 1. **balancer_ts_3338.ts** (TypeScript/Express)
Main load balancer handling connection pooling and query routing.

**Key Features:**
- Query complexity scoring algorithm
- Intelligent connection pool management
- Real-time performance metrics
- Slow query detection and logging
- Dynamic routing based on load

**Environment Variables:**
```bash
DB_HOST=postgres                    # Database hostname
DB_PORT=5432                        # Database port
DB_NAME=readme_to_recover          # Database name
DB_USER=postgres                    # Database user
DB_PASSWORD=postgres                # Database password
DB_POOL_SIZE=20                     # Max connections
DB_POOL_MIN=5                       # Min connections
DB_IDLE_TIMEOUT=30000              # Idle timeout (ms)
DB_CONN_TIMEOUT=10000              # Connection timeout (ms)
DB_STATEMENT_TIMEOUT=30000         # Query timeout (ms)
```

**Endpoints:**
```
GET  /health                          - Health check with pool stats
GET  /info                            - Service information
POST /api/query/analyze               - Analyze query complexity
GET  /api/pool/stats                  - Get pool statistics
POST /api/pool/optimize               - Get optimization suggestions
POST /api/query/execute               - Execute query via pool
GET  /api/slow-queries                - Get slow queries from pg_stat_statements
```

### 2. **pg_pooling_tuning.sh** (Bash)
Configures PostgreSQL server for optimal connection pooling.

**Operations:**
- Sets PostgreSQL tuning parameters
- Creates PgBouncer configuration
- Analyzes slow queries
- Identifies large tables for partitioning
- Shows connection statistics

### 3. **pg_pool_tuner.py** (Python)
Real-time monitoring and tuning of connection pools.

**Usage:**
```bash
python3 pg_pool_tuner.py --action analyze   # Analyze current state
python3 pg_pool_tuner.py --action optimize  # Apply optimizations
python3 pg_pool_tuner.py --action test      # Test pool with iterations
python3 pg_pool_tuner.py --action report    # Show comprehensive report
```

### 4. **deploy_pool_balancer.sh** (Bash)
Automated deployment to server.

**Features:**
- Transfers TypeScript balancer to server
- Installs npm dependencies
- Starts service and verifies listening
- Tests health endpoint
- Shows connection statistics

### 5. **monitor_pool.sh** (Bash)
Real-time monitoring dashboard.

**Displays:**
- PostgreSQL container CPU/Memory/Network
- Database connection statistics
- Balancer service status
- Slow query tracking
- System load and disk usage

## Deployment

### Quick Start

```bash
# 1. Make scripts executable
chmod +x deploy_pool_balancer.sh
chmod +x pg_pooling_tuning.sh
chmod +x monitor_pool.sh

# 2. Deploy TypeScript balancer to server
./deploy_pool_balancer.sh

# 3. Start monitoring
./monitor_pool.sh
```

### Step-by-Step Deployment

#### Step 1: Apply PostgreSQL Tuning
```bash
# On server via SSH
ssh root@46.224.205.183 << 'EOF'
cd /root/Clisonix-cloud

# Apply PostgreSQL optimizations
bash pg_pooling_tuning.sh

# Restart PostgreSQL to apply settings
docker restart clisonix-postgres

# Wait for restart
sleep 5

# Verify settings applied
docker exec clisonix-postgres psql -U postgres -c "SHOW max_connections; SHOW shared_buffers;"
EOF
```

#### Step 2: Deploy TypeScript Balancer
```bash
# From local machine
chmod +x deploy_pool_balancer.sh
./deploy_pool_balancer.sh
```

This will:
- Transfer `balancer_ts_3338.ts` to server
- Install npm dependencies (express, pg, cors, axios)
- Start service on port 3338
- Verify health endpoint responds
- Show connection statistics

#### Step 3: Verify Deployment
```bash
# Check service is running
curl -s http://46.224.205.183:3338/health | jq .

# Get pool statistics
curl -s http://46.224.205.183:3338/api/pool/stats | jq .

# Get slow queries
curl -s http://46.224.205.183:3338/api/slow-queries | jq .
```

#### Step 4: Start Monitoring
```bash
# Real-time dashboard
chmod +x monitor_pool.sh
./monitor_pool.sh
```

## Configuration Tuning

### Recommended Pool Sizes

Based on CPU cores and available memory:

| CPUs | Min Pool | Default Pool | Max Pool | Use Case |
|------|----------|--------------|----------|----------|
| 2    | 3        | 8            | 16       | Lightweight |
| 4    | 5        | 15           | 25       | **Our Setup** |
| 8    | 10       | 20           | 40       | High Load |
| 16   | 20       | 35           | 70       | Enterprise |

### Current Configuration (4-core server)

```typescript
// Connection Pool Settings
max: 20              // Maximum concurrent connections
min: 5               // Minimum idle connections
idleTimeoutMillis: 30000    // 30s idle timeout
connectionTimeoutMillis: 10000  // 10s connection timeout
statement_timeout: 30000    // 30s query timeout
```

### Adjusting Pool Size

```bash
# SSH into server and set environment variables
export DB_POOL_SIZE=25    # Increase max to 25
export DB_POOL_MIN=8      # Increase min to 8

# Restart balancer
pkill -f "node.*3338"
cd /root/Clisonix-cloud
node balancer_ts_3338.ts &
```

## Monitoring & Metrics

### Real-Time Dashboard
```bash
./monitor_pool.sh
```

Updates every 5 seconds showing:
- PostgreSQL CPU/Memory usage
- Connection counts (active, idle, idle in transaction)
- Slow query tracking
- Disk and system load

### Key Metrics to Watch

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| PostgreSQL CPU | <100% | >120% | >150% |
| Pool Utilization | <80% | >80% | >95% |
| Avg Query Time | <100ms | >200ms | >500ms |
| Idle Connections | 5-10 | N/A | N/A |

### Query Analysis

```bash
# Via API
curl -X POST http://46.224.205.183:3338/api/query/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 100 GROUP BY users.id ORDER BY orders.total DESC"}'
```

Response:
```json
{
  "complexity": 78,
  "severity": "critical",
  "recommendation": "Consider read replica or query optimization",
  "pool_stats": {
    "total": 15,
    "available": 3,
    "utilization": 80
  }
}
```

## Troubleshooting

### Issue: PostgreSQL CPU Still High (>120%)

**Diagnosis:**
```bash
# 1. Check slow queries
curl http://46.224.205.183:3338/api/slow-queries | jq .

# 2. Check pool saturation
curl http://46.224.205.183:3338/api/pool/stats | jq .

# 3. Check active connections
ssh root@46.224.205.183 'docker exec clisonix-postgres psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE datname = '\''readme_to_recover'\'';"'
```

**Solutions:**
1. Increase pool size: `export DB_POOL_SIZE=30`
2. Optimize slow queries (see slow query list)
3. Add indexes to frequently joined columns
4. Consider query caching or view materialization

### Issue: Balancer Service Not Starting

**Check logs:**
```bash
ssh root@46.224.205.183 'tail -50 /root/Clisonix-cloud/balancer_ts_3338.log'
```

**Common issues:**
- Port 3338 already in use: `pkill -f "3338"`
- Missing npm dependencies: `npm install express cors axios pg`
- Connection to PostgreSQL failing: Verify credentials and port 5432

### Issue: Connection Pool Saturation

**Symptoms:** Many idle in transaction connections, pool always at max

**Solutions:**
```sql
-- Find long-running transactions
SELECT 
    pid, 
    usename, 
    query, 
    query_start 
FROM pg_stat_activity 
WHERE state = 'idle in transaction'
ORDER BY query_start ASC;

-- Kill idle transactions older than 30 min
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle in transaction' 
AND query_start < now() - interval '30 minutes';
```

## Performance Gains Expected

### Before Pooling
- PostgreSQL CPU: 201% (uncapped, 4 cores × 50%)
- Connections per request: New connection each time
- Connection overhead: ~50-100ms per request
- Average query response: 150-300ms

### After Pooling (Expected)
- PostgreSQL CPU: 80-100% (efficient utilization)
- Connections reused: 5-20 persistent connections
- Connection overhead: <1ms (from pool)
- Average query response: 50-150ms
- **Improvement: 40-60% faster queries, 50-70% lower CPU**

## Advanced Tuning

### Enable Slow Query Logging

```sql
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries >1s
ALTER SYSTEM SET log_statement = 'all';              -- Log all queries
SELECT pg_reload_conf();
```

### Enable Query Statistics
```bash
ssh root@46.224.205.183 'docker exec clisonix-postgres psql -U postgres -d readme_to_recover -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"'
```

### Analyze Table Statistics
```bash
ssh root@46.224.205.183 'docker exec clisonix-postgres psql -U postgres -d readme_to_recover -c "ANALYZE VERBOSE;"'
```

## Files Reference

```
📁 Connection Pooling Package
├── balancer_ts_3338.ts              # Main TypeScript balancer
├── pg_pooling_tuning.sh             # PostgreSQL optimization
├── pg_pool_tuner.py                 # Python monitoring tool
├── deploy_pool_balancer.sh          # Automated deployment
├── monitor_pool.sh                  # Real-time dashboard
└── CONNECTION_POOL_GUIDE.md         # This file
```

## Next Steps

1. **Deploy:** Run `./deploy_pool_balancer.sh`
2. **Monitor:** Run `./monitor_pool.sh` and watch CPU trends
3. **Analyze:** Check `/api/slow-queries` for optimization targets
4. **Tune:** Adjust pool size if needed based on metrics
5. **Optimize:** Optimize or add indexes to slow queries
6. **Validate:** Confirm CPU drops to <100% and query times improve

## Support & Debugging

### View Service Logs
```bash
ssh root@46.224.205.183 'tail -f /root/Clisonix-cloud/balancer_ts_3338.log'
```

### Check All Services Running
```bash
ssh root@46.224.205.183 'netstat -tlnp | grep -E ":(3333|3334|3335|3336|3337|3338)"'
```

### Force Restart Services
```bash
ssh root@46.224.205.183 << 'EOF'
pkill -f "node.*3338" || true
pkill -f "python.*balancer" || true
sleep 2
cd /root/Clisonix-cloud
nohup node balancer_ts_3338.ts > balancer_ts_3338.log 2>&1 &
python3 -m uvicorn balancer_nodes_3334:app --host 0.0.0.0 --port 3334 &
python3 -m uvicorn balancer_cache_3335:app --host 0.0.0.0 --port 3335 &
python3 -m uvicorn balancer_pulse_3336:app --host 0.0.0.0 --port 3336 &
python3 -m uvicorn balancer_data_3337:app --host 0.0.0.0 --port 3337 &
EOF
```

## Version History

- **v1.0** - Initial TypeScript balancer with connection pooling
- **v1.1** - Added query complexity analyzer
- **v1.2** - Added slow query detection
- **v1.3** - Added pool optimization recommendations

## License & Credits

Part of Clisonix Cloud optimization initiative - Connection Pooling Release 2025
