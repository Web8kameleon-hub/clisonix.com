#!/bin/bash
# Real-time PostgreSQL & Connection Pool Monitoring Dashboard

SERVER_IP="46.224.205.183"
SERVER_USER="root"
POOL_PORT=3338
REFRESH_INTERVAL=5

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

while true; do
    clear
    
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   PostgreSQL & Connection Pool Real-Time Monitor${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    
    # Timestamp
    echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S')${NC} | Refresh: ${REFRESH_INTERVAL}s"
    echo ""
    
    # PostgreSQL Container Stats
    echo -e "${YELLOW}📦 POSTGRESQL CONTAINER STATS:${NC}"
    ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "
        docker stats --no-stream clisonix-postgres 2>/dev/null | tail -1 | awk '{
            printf \"   CPU: %s | MEM: %s | NET I/O: %s / %s\", \$3, \$4, \$7, \$9
        }'
        echo \"\"
    " 2>/dev/null || echo "   ⚠️  Connection failed"
    
    # Database Connection Stats
    echo -e "${YELLOW}🔌 DATABASE CONNECTION STATS:${NC}"
    ssh "$SERVER_USER@$SERVER_IP" "
        docker exec clisonix-postgres psql -U postgres -tA -c \"
        SELECT 
            'Total: ' || count(*) || ' | Active: ' || 
            sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) || ' | Idle: ' || 
            sum(CASE WHEN state = 'idle' THEN 1 ELSE 0 END)
        FROM pg_stat_activity
        WHERE datname = 'readme_to_recover';
        \" 2>/dev/null || echo '   ⚠️  DB pending...'
    " 2>&1 | sed 's/^/   /'
    
    # Balancer Service Status
    echo -e "${YELLOW}⚡ BALANCER SERVICE (Port $POOL_PORT):${NC}"
    
    # Check if process is running
    BALANCER_STATUS=$(ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "
        ps aux | grep 'node.*3338' | grep -v grep > /dev/null 2>&1 && echo 'RUNNING' || echo 'STOPPED'
    " 2>/dev/null)
    
    if [[ "$BALANCER_STATUS" == "RUNNING" ]]; then
        echo -e "   Status: ${GREEN}✅ RUNNING${NC}"
        
        # Get pool stats via HTTP
        POOL_STATS=$(curl -s -m 2 "http://$SERVER_IP:$POOL_PORT/api/pool/stats" 2>/dev/null)
        
        if [ ! -z "$POOL_STATS" ]; then
            echo "$POOL_STATS" | grep -o '"[^"]*":[^,}]*' | head -6 | sed 's/^/   /'
        else
            echo "   ℹ️  Pool stats pending..."
        fi
    else
        echo -e "   Status: ${RED}❌ STOPPED${NC}"
    fi
    
    # PostgreSQL Slow Queries
    echo ""
    echo -e "${YELLOW}🐢 TOP 3 SLOW QUERIES:${NC}"
    ssh "$SERVER_USER@$SERVER_IP" "
        docker exec clisonix-postgres psql -U postgres -d readme_to_recover -tA -c \"
        SELECT 
            LEFT(query, 50) || '...' as query,
            'mean:' || round(mean_time::numeric, 2) || 'ms' || ' max:' || round(max_time::numeric, 2) || 'ms'
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_time DESC
        LIMIT 3;
        \" 2>/dev/null || echo '   ⚠️  Pending...'
    " 2>&1 | awk '{print "   " $0}'
    
    # Running Services on Balancer Ports
    echo ""
    echo -e "${YELLOW}🎯 BALANCER INFRASTRUCTURE (Ports 3333-3337):${NC}"
    ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "
        netstat -tlnp 2>/dev/null | grep -E ':(3333|3334|3335|3336|3337)' | awk '{
            port = \$(NF-1); gsub(/.*:/, \"\", port)
            proc = \$NF; gsub(/\//, \" - \", proc)
            printf \"   Port %s: %-30s\n\", port, proc
        }'
    " 2>/dev/null || echo "   ⚠️  Connection pending..."
    
    # Disk usage
    echo ""
    echo -e "${YELLOW}💾 DISK USAGE:${NC}"
    ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "
        df -h / | awk 'NR==2 {printf \"   %s total | %s used | %s available | %s\", \$2, \$3, \$4, \$5}'
        echo \"\"
    " 2>/dev/null || echo "   ⚠️  Stats pending..."
    
    # Docker container count
    echo ""
    echo -e "${YELLOW}🐳 DOCKER CONTAINERS:${NC}"
    ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "
        RUNNING=\$(docker ps --quiet | wc -l)
        TOTAL=\$(docker ps -a --quiet | wc -l)
        echo \"   Running: \$RUNNING / Total: \$TOTAL\"
    " 2>/dev/null || echo "   ⚠️  Stats pending..."
    
    # System Load
    echo ""
    echo -e "${YELLOW}📊 SYSTEM LOAD:${NC}"
    ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "
        uptime | awk -F'load average:' '{print \"   \" \$2}'
    " 2>/dev/null || echo "   ⚠️  Stats pending..."
    
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "Press ${RED}Ctrl+C${NC} to exit | Next update in ${YELLOW}${REFRESH_INTERVAL}s${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    
    sleep $REFRESH_INTERVAL
done
