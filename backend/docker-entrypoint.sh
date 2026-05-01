#!/bin/bash
echo "[boot] PORT=$PORT"
echo "[boot] DB_HOST=$DB_HOST"
echo "[boot] DB_DATABASE=$DB_DATABASE"

php artisan migrate --force 2>&1
php artisan db:seed --force --class=UserSeeder 2>&1 || true
php artisan config:cache 2>&1
php artisan route:cache 2>&1

echo "[boot] Starting server on port ${PORT:-8000}"
php artisan serve --host=0.0.0.0 --port=${PORT:-8000} 2>&1
echo "[boot] serve exited with code $?"
