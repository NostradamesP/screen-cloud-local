#!/usr/bin/env bash
set -euo pipefail

echo "=== Signage Platform - Setup ==="

# Copy env if not exists
if [ ! -f server/.env ]; then
  cp .env.example server/.env
  echo "Created server/.env from .env.example"
fi

# Install dependencies
echo "Installing server dependencies..."
cd server && npm install && cd ..

echo "Installing web dependencies..."
cd web && npm install && cd ..

# Build web
echo "Building frontend..."
cd web && npm run build && cd ..

echo ""
echo "=== Setup complete ==="
echo ""
echo "To start the database services:"
echo "  docker compose up -d postgres redis minio"
echo ""
echo "To run migrations:"
echo "  cd server && npm run db:migrate"
echo ""
echo "To start development:"
echo "  cd server && npm run dev     # Backend on :3000"
echo "  cd web && npm run dev        # Frontend on :5173"
echo ""
echo "Or run everything:"
echo "  docker compose up --build"
echo ""
