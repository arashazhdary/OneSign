#!/bin/bash

# Backup script for OneSign Landing Page

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="onesign-landing-backup-$TIMESTAMP"

echo "Creating backup: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup archive
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='backups' \
    --exclude='logs' \
    .

echo "Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Keep only last 10 backups
ls -t "$BACKUP_DIR"/onesign-landing-backup-*.tar.gz | tail -n +11 | xargs -r rm

echo "Cleanup completed. Kept last 10 backups."
