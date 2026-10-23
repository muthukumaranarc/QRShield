#!/usr/bin/env bash
set -euo pipefail

# =========================================================================
# QRShield Guest Worker Automated Setup Script (Ubuntu Server 22.04/24.04)
# =========================================================================

echo "========================================================="
echo "  Configuring QRShield Playwright Sandbox Guest Worker   "
echo "========================================================="

# 1. Update and install OS packages
sudo apt-get update -y
sudo apt-get install -y openjdk-21-jre-headless maven curl libglib2.0-0 libnss3 libnspr4 \
    libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2 ufw

# 2. Create unprivileged sandbox user
if ! id -u sandboxuser > /dev/null 2>&1; then
    echo "[+] Creating dedicated unprivileged user 'sandboxuser'..."
    sudo useradd -m -s /bin/bash sandboxuser
fi

# 3. Create deployment directory
sudo mkdir -p /opt/qrshield-worker
sudo chown -R sandboxuser:sandboxuser /opt/qrshield-worker

# 4. Copy built JAR and systemd unit (run from project root or guest-worker directory)
if [ -f target/qrshield-guest-worker-1.0.0.jar ]; then
    sudo cp target/qrshield-guest-worker-1.0.0.jar /opt/qrshield-worker/
elif [ -f /tmp/qrshield-guest-worker-1.0.0.jar ]; then
    sudo cp /tmp/qrshield-guest-worker-1.0.0.jar /opt/qrshield-worker/
fi

sudo chown -R sandboxuser:sandboxuser /opt/qrshield-worker

# 5. Install Playwright browser dependencies as sandboxuser
echo "[+] Installing Playwright Chromium browser binaries..."
sudo -u sandboxuser bash -c '
    mvn dependency:get -Dartifact=com.microsoft.playwright:playwright:1.49.0
    java -cp "/opt/qrshield-worker/*:$(mvn dependency:build-classpath | grep -v '\[INFO\]'):." com.microsoft.playwright.CLI install --with-deps chromium || true
'

# 6. Install and enable systemd service
sudo cp qrshield-worker.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable qrshield-worker.service
sudo systemctl restart qrshield-worker.service

echo "[+] Guest Worker setup complete. Verifying status:"
sudo systemctl status qrshield-worker.service --no-pager
