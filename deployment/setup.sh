#!/bin/bash
# =============================================================================
# Wiesenwahn VPS Setup Script — Ubuntu 24.04 LTS
# =============================================================================
# Run as root on a fresh Ubuntu 24.04 server.
# Usage: bash setup.sh
# =============================================================================

set -euo pipefail

DEPLOY_DIR="/opt/wiesenwahn"
DOMAIN="wiesenwahn.de"
DEPLOY_USER="deploy"

echo "=== 1/8: System update ==="
apt-get update && apt-get upgrade -y
apt-get install -y \
    curl \
    git \
    ufw \
    fail2ban \
    nginx \
    certbot \
    python3-certbot-nginx \
    unattended-upgrades \
    apt-listchanges \
    logrotate

echo "=== 2/8: Automatic security updates ==="
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

echo "=== 3/8: Install Docker ==="
curl -fsSL https://get.docker.com | sh

# Install docker-compose plugin
apt-get install -y docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

echo "=== 4/8: Firewall (UFW) ==="
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (for certbot + redirect)
ufw allow 443/tcp   # HTTPS
ufw --force enable

echo "=== 5/8: SSH hardening ==="
# Disable password auth and root login with password
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?X11Forwarding.*/X11Forwarding no/' /etc/ssh/sshd_config
sed -i 's/^#\?MaxAuthTries.*/MaxAuthTries 3/' /etc/ssh/sshd_config
systemctl restart sshd

echo "=== 6/8: fail2ban ==="
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 24h

[nginx-http-auth]
enabled = true

[nginx-botsearch]
enabled = true

[nginx-limit-req]
enabled = true
EOF

systemctl enable fail2ban
systemctl start fail2ban

echo "=== 7/8: Application directories ==="
mkdir -p "${DEPLOY_DIR}/data"
mkdir -p "${DEPLOY_DIR}/data/signatures"
mkdir -p "${DEPLOY_DIR}/data/artist_signatures"
mkdir -p "${DEPLOY_DIR}/logs"
mkdir -p "${DEPLOY_DIR}/backups/daily"
mkdir -p "${DEPLOY_DIR}/backups/weekly"
mkdir -p "${DEPLOY_DIR}/backups/monthly"

# Copy deployment files
cp "$(dirname "$0")/backup.sh" "${DEPLOY_DIR}/backup.sh"
chmod +x "${DEPLOY_DIR}/backup.sh"

cp "$(dirname "$0")/nginx/wiesenwahn.conf" /etc/nginx/sites-available/wiesenwahn.conf
ln -sf /etc/nginx/sites-available/wiesenwahn.conf /etc/nginx/sites-enabled/wiesenwahn.conf
rm -f /etc/nginx/sites-enabled/default

# Copy logrotate config
cp "$(dirname "$0")/logrotate-wiesenwahn" /etc/logrotate.d/wiesenwahn

echo "=== 8/8: Crontab + SSL ==="
# Install crontab
crontab "$(dirname "$0")/crontab"

# Test nginx config (without SSL first)
nginx -t && systemctl reload nginx

echo ""
echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Copy your SSH keys to /root/.ssh/authorized_keys"
echo "  2. Copy .env file to ${DEPLOY_DIR}/.env (see .env.example)"
echo "  3. Log in to GHCR:  docker login ghcr.io"
echo "  4. Get SSL cert:    certbot --nginx -d ${DOMAIN}"
echo "  5. Copy docker-compose.yml to ${DEPLOY_DIR}/"
echo "  6. Update GitHub Actions secrets (SERVER_HOST, SSH_PRIVATE_KEY, etc.)"
echo "  7. Trigger a deploy or run:  cd ${DEPLOY_DIR} && docker compose up -d"
echo ""
