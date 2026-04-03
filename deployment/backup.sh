#!/bin/bash
# =============================================================================
# Wiesenwahn Database Backup Script
# =============================================================================
# Usage: bash backup.sh [daily|weekly|monthly|deploy-backup]
# Installed via crontab (see deployment/crontab)
# =============================================================================

set -euo pipefail

BACKUP_DIR="/opt/wiesenwahn/backups"
DB_DIR="/opt/wiesenwahn/data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE=${1:-"daily"}
NOTIFY_EMAIL="hauptmann.christian@yahoo.com"
RETENTION_DAYS=14
RETENTION_WEEKS=56    # 8 weeks
RETENTION_MONTHS=365  # 12 months

mkdir -p "${BACKUP_DIR}/daily"
mkdir -p "${BACKUP_DIR}/weekly"
mkdir -p "${BACKUP_DIR}/monthly"

send_notification() {
    local subject="$1"
    local message="$2"

    cd /opt/wiesenwahn
    docker compose exec -T backend python -c "
from src.services.mail_service import send_simple_mail
send_simple_mail('${NOTIFY_EMAIL}', '${subject}', '${message}')
" || echo "Failed to send notification: $subject - $message"
}

if [ ! -d "$DB_DIR" ]; then
    send_notification "Database Backup Failed" "Database directory $DB_DIR not found!"
    exit 1
fi

BACKUP_FILENAME="${BACKUP_TYPE}_${TIMESTAMP}.tar.gz"

echo "Creating backup: ${BACKUP_DIR}/${BACKUP_TYPE}/${BACKUP_FILENAME}"
tar -czf "${BACKUP_DIR}/${BACKUP_TYPE}/${BACKUP_FILENAME}" -C "${DB_DIR}" .

if [ $? -ne 0 ]; then
    send_notification "Database Backup Failed" "Backup creation failed for ${BACKUP_FILENAME}"
    exit 1
fi

sha256sum "${BACKUP_DIR}/${BACKUP_TYPE}/${BACKUP_FILENAME}" \
    > "${BACKUP_DIR}/${BACKUP_TYPE}/${BACKUP_FILENAME}.sha256"

# Clean up old backups based on type
case "$BACKUP_TYPE" in
    daily)
        find "${BACKUP_DIR}/daily" -name "daily_*" -mtime +${RETENTION_DAYS} -delete
        ;;
    weekly)
        find "${BACKUP_DIR}/weekly" -name "weekly_*" -mtime +${RETENTION_WEEKS} -delete
        ;;
    monthly)
        find "${BACKUP_DIR}/monthly" -name "monthly_*" -mtime +${RETENTION_MONTHS} -delete
        ;;
esac

if [ "$BACKUP_TYPE" != "deploy-backup" ]; then
    send_notification "Database Backup Successful" "Backup ${BACKUP_FILENAME} created successfully."
fi

echo "Backup completed successfully"
