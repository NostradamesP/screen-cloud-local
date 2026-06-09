#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ]; then
  echo "Uso: scripts/restore-local.sh backups/FECHA/postgres.sql [backups/FECHA/uploads.tar.gz]"
  exit 1
fi

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
SQL_FILE="$1"
UPLOADS_FILE="${2:-}"

if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-screencloudlocal}"

cd "$ROOT_DIR"
docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml exec -T postgres \
  psql -U "${POSTGRES_USER:-signage}" "${POSTGRES_DB:-signage}" < "$SQL_FILE"

if [ -n "$UPLOADS_FILE" ]; then
  docker run --rm \
    -v "${PROJECT_NAME}_uploads:/data" \
    -v "$(cd "$(dirname "$UPLOADS_FILE")" && pwd):/backup:ro" \
    alpine sh -c "rm -rf /data/* && cd /data && tar xzf /backup/$(basename "$UPLOADS_FILE")"
fi

echo "Restore completado."
