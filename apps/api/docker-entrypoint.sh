#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/apps/api
npx prisma migrate deploy

echo "Starting server..."
cd /app/apps/api
exec node dist/src/main
