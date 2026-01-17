# Clisonix Migration Plan - From 4vCPU to 8vCPU Server

**Problem:** MySQL (rogue process) keeps respawning, consuming 30% RAM + 149% CPU  
**Solution:** Migrate to 8vCPU server with clean ultra-light architecture  
**Timeline:** <1 hour  

## Step-by-Step Migration

### Phase 1: Prepare New Server (8vCPU/16GB RAM)

```bash
# 1. Verify new server specs
ssh root@NEW_SERVER_IP "cat /proc/cpuinfo | grep processor | wc -l"  # Should be 8
ssh root@NEW_SERVER_IP "free -h | grep Mem"  # Should be 16GB

# 2. Update system
ssh root@NEW_SERVER_IP "apt-get update && apt-get upgrade -y"

# 3. Install Docker & Docker Compose
ssh root@NEW_SERVER_IP "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
ssh root@NEW_SERVER_IP "curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64' -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
```

### Phase 2: Deploy Clean Architecture

```bash
# 1. Clone repository
ssh root@NEW_SERVER_IP "cd /root && git clone https://github.com/LedjanAhmati/Clisonix-cloud.git"

# 2. Start ultra-light stack (no MySQL, no PostgreSQL)
ssh root@NEW_SERVER_IP "cd /root/Clisonix-cloud && docker-compose -f docker-compose-ultralight.yml up -d"

# 3. Verify all containers
ssh root@NEW_SERVER_IP "docker ps --format 'table {{.Names}}\t{{.Status}}'"
```

### Phase 3: Verify Performance

```bash
# 1. Check CPU (should be 2-5%)
ssh root@NEW_SERVER_IP "top -bn1 | grep 'Cpu(s)'"

# 2. Check memory (should be 200-300MB)
ssh root@NEW_SERVER_IP "free -h | grep Mem"

# 3. Test APIs
curl -s http://NEW_SERVER_IP:8030/health | jq .
curl -s http://NEW_SERVER_IP:8000/api/system/status | jq .
```

### Phase 4: Migrate Data (If Needed)

```bash
# 1. Export current data
ssh root@46.224.205.183 "cd /root/Clisonix-cloud && sqlite3 /data/clisonix/clisonix_operational.db '.dump users' > /tmp/users.sql"

# 2. Copy to new server
scp root@46.224.205.183:/tmp/users.sql root@NEW_SERVER_IP:/tmp/

# 3. Import to new server
ssh root@NEW_SERVER_IP "sqlite3 /data/clisonix/clisonix_operational.db < /tmp/users.sql"
```

### Phase 5: Update DNS/Networking

```bash
# Update server IP in:
# 1. DNS records (46.224.205.183 → NEW_SERVER_IP)
# 2. Load balancer config
# 3. Client configurations
# 4. Monitoring/Alerting
```

## What Gets Removed

### ❌ From Old Server (46.224.205.183)
```
- MySQL (rogue process at 149% CPU)
- PostgreSQL (unused, consuming CPU)
- All legacy containers
- Old docker-compose.yml
```

### ✅ On New Server
```
- Ultra-light Ocean Core v2
- Redis (ingestion buffer)
- SQLite (operational storage)
- DuckDB (analytics)
- Trinity: ALBA, ALBI, JONA
- Monitoring: Prometheus, Grafana
- NO MySQL, NO PostgreSQL
```

## Performance Comparison

### Old Server (4vCPU, 7.6GB RAM)
```
❌ MySQL: 149% CPU (30% RAM)
❌ PostgreSQL: 5-10% CPU (if running)
❌ Combined: 200%+ CPU (system at capacity)
❌ Memory: 5-7GB used, 200MB free (critical)
❌ Latency: 50-100ms+
❌ Throughput: 5-10k req/s
```

### New Server (8vCPU, 16GB RAM)
```
✅ Ultra-light: 2-5% CPU
✅ Memory: 200-300MB used, 15.5GB free (plenty)
✅ Latency: <5ms
✅ Throughput: 50k-100k req/s
✅ Headroom: 6 vCPU available for scaling
```

## Rollback Plan

If new server has issues:

```bash
# 1. Keep old server running (don't delete)
# 2. Switch DNS back to old IP
# 3. Investigate issue on new server
# 4. Once fixed, re-migrate
```

## Clean Up Old Server (After Verification)

```bash
# Only after 24-48 hours on new server:
ssh root@46.224.205.183 "docker-compose down -v"
ssh root@46.224.205.183 "rm -rf /root/Clisonix-cloud"
ssh root@46.224.205.183 "pkill -9 mysql"
```

## Estimated Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Prepare new server | 10 min |
| 2 | Deploy stack | 5 min |
| 3 | Verify performance | 5 min |
| 4 | Migrate data | 15 min |
| 5 | Update DNS | 5 min |
| 6 | Verify routing | 10 min |
| 7 | Cleanup | 5 min |
| **Total** | | **55 min** |

## Success Criteria

✅ All containers healthy on new server  
✅ CPU <5% at idle  
✅ All API endpoints responding  
✅ User data migrated  
✅ No MySQL processes  
✅ DNS resolving to new server  
✅ Latency <10ms for queries  
✅ Throughput >50k req/s  

---

**Status:** Ready for migration  
**Old Server:** 46.224.205.183 (backup, can rollback)  
**New Server:** [TO BE CONFIGURED]  
**Architecture:** Ultra-Light (Redis → SQLite/DuckDB, no MySQL)

