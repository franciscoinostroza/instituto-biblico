#!/bin/sh
echo "[boot] PORT=$PORT"
echo "[boot] APP_KEY=${APP_KEY:0:10}"
echo "[boot] DB_HOST=$DB_HOST"
php artisan serve --host=0.0.0.0 --port=${PORT:-8000} 2>&1
echo "[boot] serve exited with code $?"
