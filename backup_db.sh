#!/bin/bash

# Define the paths
DB_PATH="/var/www/event-booking-sytem/server/db/bookings.db"
BACKUP_DIR="/var/db_backups"

# Generate the timestamp
DATE=$(date +%Y%m%d_%H%M%S)

# Perform the backup
cp $DB_PATH $BACKUP_DIR/bookings_backup_$DATE.db
