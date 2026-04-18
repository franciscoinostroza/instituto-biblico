FROM php:8.3-cli

# Extensiones del sistema
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev libzip-dev libicu-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring bcmath gd zip intl pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Crear directorios necesarios antes de que composer corra los scripts
RUN mkdir -p bootstrap/cache storage/logs storage/framework/cache \
    storage/framework/sessions storage/framework/views \
    && chmod -R 775 bootstrap/cache storage

# Resolver dependencias (regenera composer.lock si está desactualizado)
RUN composer update --no-dev --optimize-autoloader --no-interaction --prefer-dist

EXPOSE 8000

CMD echo "=== Starting ===" \
    && php -v \
    && echo "=== Migrate ===" \
    && php artisan migrate --force \
    && echo "=== Config cache ===" \
    && php artisan config:cache \
    && echo "=== Serving on port ${PORT:-8000} ===" \
    && exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
