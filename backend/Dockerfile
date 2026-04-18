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

# Resolver dependencias (regenera composer.lock si está desactualizado)
RUN composer update --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Permisos de storage
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD php artisan migrate --force \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
