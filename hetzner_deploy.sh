#!/bin/bash
# Clisonix Cloud - Hetzner Deployment Script
# Run as: bash hetzner_deploy.sh

set -e

echo "🚀 Clisonix Cloud - Hetzner Deployment"
echo "========================================"

# Update system
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📥 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📥 Installing Docker Compose..."
    apt-get install -y docker-compose || \
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create application directory
echo "📁 Setting up directories..."
mkdir -p /opt/clisonix
cd /opt/clisonix

# Copy files (assuming they're uploaded or cloned)
echo "📋 Preparing configuration..."
if [ ! -f "docker-compose.yml" ]; then
    echo "⚠️  docker-compose.yml not found. Please copy it to /opt/clisonix/"
    exit 1
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

# Show URLs
echo ""
echo "✅ Deployment complete!"
echo "========================================"
echo "Frontend:  http://157.90.234.158:3000"
echo "API:       http://157.90.234.158:8000"
echo "API Docs:  http://157.90.234.158:8000/docs"
echo "Grafana:   http://157.90.234.158:3001"
echo "MinIO:     http://157.90.234.158:9001"
echo "========================================"
