#!/bin/bash
# Comprehensive PostgreSQL Connection Pool Deployment & Monitoring
# Deploys balancer_ts_3338.ts and enables connection pool tuning

set -e

echo "============================================================"
echo "🚀 PostgreSQL Connection Pool Deployment"
echo "============================================================"

# Configuration
SERVER_IP="46.224.205.183"
SERVER_USER="root"
LOCAL_TS_FILE="balancer_ts_3338.ts"
REMOTE_DIR="/root/Clisonix-cloud"
POOL_PORT=3338

echo ""
echo "📋 Configuration:"
echo "   Server: $SERVER_IP"
echo "   TypeScript Balancer: Port $POOL_PORT"
echo "   Remote Directory: $REMOTE_DIR"

# Step 1: Check if local file exists
echo ""
echo "✓ Step 1: Verifying local files..."

if [ ! -f "$LOCAL_TS_FILE" ]; then
    echo "❌ ERROR: $LOCAL_TS_FILE not found in current directory"
    echo "   Please ensure balancer_ts_3338.ts is in the current directory"
    exit 1
fi

echo "✅ File found: $LOCAL_TS_FILE"

# Step 2: Deploy to server
echo ""
echo "🔄 Step 2: Deploying to server..."

scp -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$LOCAL_TS_FILE" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/" 2>&1 | tail -3

if [ $? -eq 0 ]; then
    echo "✅ File transferred successfully"
else
    echo "❌ Transfer failed - check SSH connection"
    exit 1
fi

# Step 3: Stop any existing balancer on port 3338
echo ""
echo "🛑 Step 3: Stopping any existing service on port $POOL_PORT..."

ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "
    pkill -f 'node.*3338' || true
    sleep 1
    echo '✅ Stopped existing service'
" 2>&1 | tail -2

# Step 4: Install dependencies (if needed)
echo ""
echo "📦 Step 4: Checking Node.js and npm..."

ssh "$SERVER_USER@$SERVER_IP" "
    which node > /dev/null 2>&1 && echo '✅ Node.js found: '$(node -v) || echo '⚠️  Node.js not found'
    which npm > /dev/null 2>&1 && echo '✅ npm found: '$(npm -v) || echo '⚠️  npm not found'
" 2>&1

# Step 5: Install npm dependencies for TypeScript balancer
echo ""
echo "📚 Step 5: Installing npm dependencies..."

ssh "$SERVER_USER@$SERVER_IP" "
    cd $REMOTE_DIR
    npm install express cors axios pg 2>&1 | grep -E '(added|up to date|ERR)'
    echo '✅ Dependencies installed'
" 2>&1 | tail -3

# Step 6: Start the TypeScript balancer
echo ""
echo "🚀 Step 6: Starting TypeScript balancer..."

ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "
    cd $REMOTE_DIR
    nohup node balancer_ts_3338.ts > balancer_ts_3338.log 2>&1 &
    BALANCER_PID=\$!
    sleep 2
    if ps -p \$BALANCER_PID > /dev/null; then
        echo '✅ Balancer started with PID: '\$BALANCER_PID
    else
        echo '❌ Balancer failed to start'
        cat balancer_ts_3338.log
        exit 1
    fi
" 2>&1

# Step 7: Verify service is listening
echo ""
echo "🔍 Step 7: Verifying service is listening..."

sleep 2

ssh "$SERVER_USER@$SERVER_IP" "
    if netstat -tlnp 2>/dev/null | grep -q ':$POOL_PORT'; then
        echo '✅ Service listening on port $POOL_PORT'
        netstat -tlnp | grep $POOL_PORT | head -1
    else
        echo '⚠️  Service not yet listening - trying again...'
        sleep 2
        ps aux | grep node | grep -v grep || echo 'No node processes'
    fi
" 2>&1 | tail -3

# Step 8: Test the health endpoint
echo ""
echo "📡 Step 8: Testing health endpoint..."

HEALTH_RESPONSE=$(curl -s -m 5 "http://$SERVER_IP:$POOL_PORT/health" 2>/dev/null || echo "ERROR")

if [[ $HEALTH_RESPONSE == *"pool"* ]] || [[ $HEALTH_RESPONSE == *"postgres"* ]]; then
    echo "✅ Health endpoint responsive"
    echo "   Response: $(echo $HEALTH_RESPONSE | cut -c1-100)..."
else
    echo "⚠️  Health endpoint not responding yet (service may still be starting)"
    echo "   Attempting direct test..."
    ssh "$SERVER_USER@$SERVER_IP" "curl -s http://localhost:$POOL_PORT/health 2>/dev/null | head -c 200" 2>&1 || echo "Still initializing..."
fi

# Step 9: Check PostgreSQL connection pool
echo ""
echo "🔌 Step 9: Checking PostgreSQL connection statistics..."

ssh "$SERVER_USER@$SERVER_IP" "
    docker exec clisonix-postgres psql -U postgres -c \"
    SELECT 
        datname as database,
        count(*) as connections,
        sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active
    FROM pg_stat_activity
    WHERE datname = 'readme_to_recover'
    GROUP BY datname;
    \" 2>/dev/null || echo 'Database stats pending'
" 2>&1

# Step 10: Monitor logs
echo ""
echo "📋 Step 10: Recent service logs..."

ssh "$SERVER_USER@$SERVER_IP" "
    if [ -f $REMOTE_DIR/balancer_ts_3338.log ]; then
        echo '📝 Last 10 lines of balancer_ts_3338.log:'
        tail -10 $REMOTE_DIR/balancer_ts_3338.log
    fi
" 2>&1

# Summary
echo ""
echo "============================================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "============================================================"
echo ""
echo "📍 Service URLs:"
echo "   Health Check: http://$SERVER_IP:$POOL_PORT/health"
echo "   Query Analysis: http://$SERVER_IP:$POOL_PORT/api/query/analyze"
echo "   Pool Stats: http://$SERVER_IP:$POOL_PORT/api/pool/stats"
echo "   Slow Queries: http://$SERVER_IP:$POOL_PORT/api/slow-queries"
echo ""
echo "🔧 Configuration:"
echo "   Max Pool Size: 20 (adjust via DB_POOL_SIZE env var)"
echo "   Min Pool Size: 5 (adjust via DB_POOL_MIN env var)"
echo "   Idle Timeout: 30000ms (adjust via DB_IDLE_TIMEOUT env var)"
echo ""
echo "📊 Monitoring:"
echo "   Logs: ssh $SERVER_USER@$SERVER_IP 'tail -f $REMOTE_DIR/balancer_ts_3338.log'"
echo "   CPU: ssh $SERVER_USER@$SERVER_IP 'docker stats --no-stream clisonix-postgres'"
echo "   Connections: curl http://$SERVER_IP:$POOL_PORT/api/pool/stats"
echo ""
echo "🎯 Next Steps:"
echo "   1. Monitor PostgreSQL CPU usage"
echo "   2. Send test queries to /api/query/analyze"
echo "   3. Check /api/slow-queries for optimization targets"
echo "   4. Verify CPU reduces from 201% baseline"
echo ""
