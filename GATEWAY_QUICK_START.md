# 🎯 NANOGRIDATA GATEWAY - QUICK START GUIDE

**Status:** ✅ LIVE ON PRODUCTION (46.224.203.89)  
**Ports:** TCP 5678 (data), HTTP 5679 (metrics)  
**Memory:** 64 MB | CPU: 0.1 cores | **Impact on System: ZERO**

---

## 🚀 TESTING THE GATEWAY

### From Production Server
```bash
# SSH to Hetzner
ssh root@46.224.203.89

# Check health
curl http://localhost:5679/health
# Expected: {"ok":true}

# View real-time logs
docker logs -f nanogridata-gateway

# Check container status
docker ps --filter name=nanogridata
```

### From Your Local Machine
```bash
# Test remote gateway health
curl http://46.224.203.89:5679/health
# Expected: {"ok":true}

# Send a test packet (requires Nanogridata format)
# Python example:
python3 << 'EOF'
import socket
import struct
import cbor2

# Create minimal Nanogridata packet
magic = bytes([0xC1, 0x53])
version = 0x01
payload_type = 1  # TELEMETRY
model_id = 1      # ESP32_PRESSURE
timestamp = 1705595313
payload = cbor2.dumps({"temperature": 23.5, "pressure": 1013.25})
mac = b'\x00' * 32  # Placeholder MAC

packet = magic + struct.pack('B', version) + struct.pack('B', payload_type) + struct.pack('B', model_id) + struct.pack('I', timestamp) + struct.pack('H', len(payload)) + payload + mac

# Send to gateway
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('46.224.203.89', 5678))
sock.sendall(packet)
sock.close()
print("✅ Test packet sent!")
EOF
```

---

## 📊 MONITORING

### Real-time Logs
```bash
docker logs -f nanogridata-gateway
```

### Metrics Endpoint
```bash
curl http://localhost:5679/metrics
# Returns: {
#   "ok": true,
#   "uptime_seconds": 125,
#   "packets_received": 42,
#   "packets_valid": 38,
#   "packets_rejected": 4,
#   "active_connections": 2,
#   "errors": 0
# }
```

### Check ALBA Integration
```bash
# From production server
curl http://localhost:5555/status
# Should show healthy if packets are being routed
```

---

## 🔧 MANUAL MANAGEMENT

### Start/Stop Gateway
```bash
# Stop
docker stop nanogridata-gateway

# Start
docker start nanogridata-gateway

# Restart
docker restart nanogridata-gateway
```

### View Configuration
```bash
cat /opt/clisonix-cloud/.env.nanogridata
# Shows current ESP32_SECRET and STM32_SECRET
```

### Update Secrets
```bash
# If you need to rotate secrets
ssh root@46.224.203.89 "cd /opt/clisonix-cloud && bash deploy_gateway_server.sh"
# Creates new secrets in .env.nanogridata
```

---

## 🎓 ARCHITECTURE OVERVIEW

```
Embedded Device (ESP32/STM32)
        ↓ (Nanogridata Protocol, CBOR-encoded)
TCP Port 5678
        ↓
    Gateway Service
    • Validates CBOR
    • Detects replays
    • Verifies MAC
        ↓ (HTTP POST /ingest)
TCP Port 5555 (ALBA Collector)
        ↓
PostgreSQL / InfluxDB
```

---

## ✅ DEPLOYMENT CHECKLIST

- [x] Nanogridata Gateway service deployed
- [x] All services operational and healthy
- [x] Gateway health endpoint responding (200 OK)
- [x] Docker image built with dependencies
- [x] Environment variables configured
- [x] Container restart policy enabled
- [x] Logging configured
- [x] Zero impact on existing services verified
- [x] Security features enabled
- [x] Commit pushed to GitHub (e775a48)

---

## 📋 FILES DEPLOYED

### New Deployment Files (This Session)
- `deploy_gateway_server.sh` - Server-side deployment script
- `Dockerfile.multistage` - Multi-stage build with dependencies
- `NANOGRIDATA_DEPLOYMENT_VERIFICATION.md` - This verification report

### Previously Deployed Files
- `nanogridata_gateway.js` - Compiled gateway (500+ lines)
- `docker-compose.nanogridata.yml` - Docker Compose config
- `NANOGRIDATA_DEPLOYMENT_GUIDE.md` - Operational guide
- `NANOGRIDATA_SYSTEM_ARCHITECTURE.md` - Architecture reference

---

## 🚨 TROUBLESHOOTING

### Container Restarting?
```bash
docker logs nanogridata-gateway | tail -30
# Check for module errors or connection issues
```

### Health Check Failing?
```bash
# Verify port availability
netstat -tlnp | grep 5679

# Check if process is listening
docker exec nanogridata-gateway lsof -i :5679
```

### ALBA Not Receiving Packets?
```bash
# Verify network connectivity
docker exec nanogridata-gateway ping alba
docker exec nanogridata-gateway curl http://alba:5555/status

# Check routing configuration
docker logs nanogridata-gateway | grep -i alba
```

---

## 📞 SUPPORT CONTACT

For issues or questions:
1. Check logs: `docker logs -f nanogridata-gateway`
2. Review documentation: `NANOGRIDATA_DEPLOYMENT_GUIDE.md`
3. Verify service: `curl http://localhost:5679/health`
4. Contact: Check GitHub issues or monitoring dashboard

---

## 🎉 SUCCESS!

**Your Nanogridata Gateway is ready to receive embedded device data!**

Next: Send test packets from ESP32/STM32 devices to `46.224.203.89:5678`

---

*Last Updated: 2026-01-17 16:52 UTC*  
*Deployment Commit: e775a48*
