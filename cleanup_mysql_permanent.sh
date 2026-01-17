#!/bin/bash
# Remove MySQL completely from old server
# This ensures it won't respawn after migration

set -e

echo "========================================="
echo "🔥 CLISONIX MYSQL REMOVAL SCRIPT"
echo "========================================="
echo ""

# Kill all MySQL processes
echo "1️⃣  Killing MySQL processes..."
pkill -9 mysql 2>/dev/null || true
pkill -9 -f '/tmp/mysql' 2>/dev/null || true
killall -9 mysql 2>/dev/null || true

sleep 2

# Check if MySQL is gone
if ps aux | grep mysql | grep -v grep > /dev/null; then
    echo "❌ MySQL still running!"
    ps aux | grep mysql | grep -v grep
    exit 1
fi
echo "✅ MySQL processes killed"

# Remove MySQL binary
echo ""
echo "2️⃣  Removing MySQL binary..."
rm -f /tmp/mysql 2>/dev/null || true
rm -f /usr/bin/mysql* 2>/dev/null || true
rm -f /usr/sbin/mysqld* 2>/dev/null || true
echo "✅ MySQL binary removed"

# Remove MySQL from autostart
echo ""
echo "3️⃣  Removing MySQL from autostart..."
systemctl disable mysql 2>/dev/null || true
systemctl disable mysql.service 2>/dev/null || true
systemctl disable mysqld 2>/dev/null || true
systemctl disable mysqld.service 2>/dev/null || true
echo "✅ MySQL autostart disabled"

# Remove MySQL config
echo ""
echo "4️⃣  Removing MySQL configuration..."
rm -rf /etc/mysql 2>/dev/null || true
rm -f /etc/my.cnf 2>/dev/null || true
echo "✅ MySQL configuration removed"

# Remove MySQL data directories
echo ""
echo "5️⃣  Removing MySQL data..."
rm -rf /var/lib/mysql 2>/dev/null || true
rm -rf /var/run/mysqld 2>/dev/null || true
echo "✅ MySQL data removed"

# Block MySQL from running via iptables
echo ""
echo "6️⃣  Blocking MySQL execution (iptables)..."
iptables -A OUTPUT -m owner --uid-owner 70 -j DROP 2>/dev/null || true
iptables -A OUTPUT -p tcp --dport 3306 -j DROP 2>/dev/null || true
echo "✅ Firewall rules added"

# Final verification
echo ""
echo "7️⃣  Final verification..."
if ps aux | grep mysql | grep -v grep > /dev/null; then
    echo "❌ FAILED: MySQL still running"
    exit 1
fi
echo "✅ No MySQL processes found"

# Show final status
echo ""
echo "========================================="
echo "✅ MYSQL COMPLETELY REMOVED"
echo "========================================="
echo ""
echo "Current system status:"
top -bn1 | head -8
echo ""
echo "Ready for migration to 8vCPU server!"
echo ""
