#!/bin/sh
echo "[boot] starting php artisan serve on port ${PORT:-8000}"
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
