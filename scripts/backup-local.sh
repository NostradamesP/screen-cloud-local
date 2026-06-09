#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT_DIR/backups/$STAMP"

if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-screencloudlocal}"

mkdir -p "$BACKUP_DIR"
cd "$ROOT_DIR"

docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-signage}" "${POSTGRES_DB:-signage}" > "$BACKUP_DIR/postgres.sql"

docker run --rm \
  -v "${PROJECT_NAME}_uploads:/data:ro" \
  -v "$BACKUP_DIR:/backup" \
  alpine sh -c "cd /data && tar czf /backup/uploads.tar.gz ."

echo "Backup listo en: $BACKUP_DIR"
