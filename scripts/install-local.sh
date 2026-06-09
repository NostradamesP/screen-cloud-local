#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.production"

if [ ! -f "$ENV_FILE" ]; then
  cp "$ROOT_DIR/.env.production.example" "$ENV_FILE"
  echo "Creé .env.production."
fi

random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 24
  else
    date +%s | sha256sum | cut -d' ' -f1
  fi
}

POSTGRES_PASSWORD_VALUE="$(random_secret)"
JWT_SECRET_VALUE="$(random_secret)$(random_secret)"

if grep -q 'change-me-postgres-password' "$ENV_FILE"; then
  sed -i.bak "s/change-me-postgres-password/$POSTGRES_PASSWORD_VALUE/g" "$ENV_FILE"
fi

if grep -q 'change-me-long-random-secret-at-least-32-chars' "$ENV_FILE"; then
  sed -i.bak "s/change-me-long-random-secret-at-least-32-chars/$JWT_SECRET_VALUE/g" "$ENV_FILE"
fi

if grep -q 'change-me-admin-password' "$ENV_FILE"; then
  sed -i.bak "s/change-me-admin-password/$(random_secret)/g" "$ENV_FILE"
fi

rm -f "$ENV_FILE.bak"

cd "$ROOT_DIR"
docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml up -d --build

echo "Esperando a que la API esté lista..."
for i in $(seq 1 60); do
  if docker compose --env-file "$ENV_FILE" -f docker-compose.prod.yml exec -T api wget -qO- http://localhost:3000/health >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

ADMIN_EMAIL="$(grep '^ADMIN_EMAIL=' "$ENV_FILE" | cut -d= -f2- || true)"
ADMIN_PASSWORD="$(grep '^ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2- || true)"
ADMIN_NAME="$(grep '^ADMIN_NAME=' "$ENV_FILE" | cut -d= -f2- || true)"
WEB_PORT="$(grep '^WEB_PORT=' "$ENV_FILE" | cut -d= -f2- || true)"
WEB_PORT="${WEB_PORT:-8080}"

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  curl -fsS -X POST "http://127.0.0.1:$WEB_PORT/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"name\":\"${ADMIN_NAME:-Admin}\"}" >/dev/null 2>&1 || true
fi

echo "Admin:  http://127.0.0.1:$WEB_PORT"
echo "Player: http://127.0.0.1:$WEB_PORT/player"
