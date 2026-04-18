#!/bin/sh
set -e

echo "[entrypoint] PHP version:"
php -v

echo "[entrypoint] Running migrations..."
php artisan migrate --force || echo "[entrypoint] Migration failed, continuing..."

echo "[entrypoint] Caching config..."
php artisan config:cache || echo "[entrypoint] Config cache failed, continuing..."

echo "[entrypoint] Starting server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
