# Wiesenwahn VPS Deployment

## Server Requirements
- Ubuntu 24.04 LTS
- Minimum 10 GB disk / 512 MB RAM
- Domain: wiesenwahn.de pointing to server IP

## Fresh Server Setup

```bash
# 1. SSH into new server and upload this directory
scp -r deployment/ root@<server-ip>:/tmp/deployment/

# 2. Run setup script
ssh root@<server-ip>
bash /tmp/deployment/setup.sh

# 3. Add SSH keys
cat >> /root/.ssh/authorized_keys << 'EOF'
<your-ssh-public-keys>
<github-actions-deploy-key>
EOF

# 4. Create .env file
cp /tmp/deployment/.env.example /opt/wiesenwahn/.env
nano /opt/wiesenwahn/.env   # fill in values

# 5. Get SSL certificate
certbot --nginx -d wiesenwahn.de

# 6. Login to GitHub Container Registry
docker login ghcr.io -u <github-username>

# 7. Copy docker-compose.yml and start
cp docker-compose.yml /opt/wiesenwahn/
cd /opt/wiesenwahn
docker compose up -d

# 8. Update GitHub Actions secrets
#    - SERVER_HOST: new server IP
#    - SERVER_PORT: 22
#    - SERVER_USERNAME: root
#    - SSH_PRIVATE_KEY: matching deploy key
#    - JWT_SECRET_KEY, USER_PASSWORD, ADMIN_PASSWORD, ARTIST_PASSWORD
#    - GMAIL_USER, GMAIL_PASS
```

## Architecture

```
Internet → nginx (443/SSL) → Docker containers
                            ├── frontend (127.0.0.1:8080)
                            └── backend  (127.0.0.1:5001)
```

## Backups

Automated via crontab (see `crontab` file):
- **Daily** at 02:00 — retained 14 days
- **Weekly** (Sunday 03:00) — retained 8 weeks
- **Monthly** (1st, 04:00) — retained 12 months

Backups stored at `/opt/wiesenwahn/backups/`. Email notification on success/failure.

## Security

- **Firewall (UFW)**: Only ports 22, 80, 443 open
- **fail2ban**: Blocks brute-force SSH and nginx attacks
- **nginx**: Rate limiting, security headers, common scan paths blocked
- **SSH**: Key-only auth, no password login, max 3 attempts
- **Auto-updates**: Unattended security upgrades enabled
- **Docker ports**: Bound to 127.0.0.1 only (not publicly accessible)

## Files

| File | Purpose |
|------|---------|
| `setup.sh` | Full server provisioning script |
| `nginx/wiesenwahn.conf` | nginx reverse proxy + security config |
| `backup.sh` | Database backup script (installed to `/opt/wiesenwahn/`) |
| `crontab` | Backup schedule (install with `crontab crontab`) |
| `logrotate-wiesenwahn` | Log rotation config |
| `.env.example` | Required environment variables template |
