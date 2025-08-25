#!/bin/bash

# EarningsGen AI Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting EarningsGen AI deployment..."

# Configuration
APP_NAME="earnings-gen-ai"
DEPLOY_DIR="/var/www/earnings-gen-ai"
BACKUP_DIR="/var/backups/earnings-gen-ai"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
    print_error "Node.js version 18 or higher is required (current: $NODE_VERSION)"
    exit 1
fi

print_status "Prerequisites check passed"

# Create backup
print_status "Creating backup..."
if [ -d "$DEPLOY_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/backup_$TIMESTAMP"
    print_status "Backup created: backup_$TIMESTAMP"
fi

# Create deployment directory
print_status "Setting up deployment directory..."
sudo mkdir -p "$DEPLOY_DIR"
sudo chown $USER:$USER "$DEPLOY_DIR"

# Copy application files
print_status "Copying application files..."
cp -r . "$DEPLOY_DIR/"
cd "$DEPLOY_DIR"

# Install dependencies
print_status "Installing dependencies..."
cd server
npm install --production
cd ..

# Set up environment
print_status "Setting up environment..."
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Please create one with required configuration."
fi

# Set permissions
print_status "Setting permissions..."
chmod +x scripts/*.sh 2>/dev/null || true
chmod 644 .env 2>/dev/null || true

# Create systemd service (if running on Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_status "Setting up systemd service..."
    sudo tee /etc/systemd/system/earnings-gen-ai.service > /dev/null <<EOF
[Unit]
Description=EarningsGen AI Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR/server
ExecStart=/usr/bin/node simple-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable earnings-gen-ai
    print_status "Systemd service created and enabled"
fi

# Start the application
print_status "Starting application..."
cd server
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start earnings-gen-ai
    print_status "Application started via systemd"
else
    nohup node simple-server.js > ../logs/server.log 2>&1 &
    echo $! > ../server.pid
    print_status "Application started in background (PID: $(cat ../server.pid))"
fi

# Health check
print_status "Performing health check..."
sleep 5
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    print_status "Health check passed"
else
    print_warning "Health check failed - application may not be running properly"
fi

print_status "Deployment completed successfully!"
print_status "Application URL: http://localhost:8000"
print_status "Health check: http://localhost:8000/api/health"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_status "Service status: sudo systemctl status earnings-gen-ai"
    print_status "View logs: sudo journalctl -u earnings-gen-ai -f"
else
    print_status "View logs: tail -f logs/server.log"
    print_status "Stop application: kill \$(cat server.pid)"
fi
