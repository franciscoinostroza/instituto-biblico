<?php

return [
    'paths' => ['api/*', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    /*
     * Orígenes permitidos. En producción Railway lee FRONTEND_URL del env.
     * Como usamos token Bearer (no cookies), supports_credentials es false
     * y se puede usar wildcard si es necesario.
     */
    'allowed_origins' => [
        'https://instituto-biblico.vercel.app',
        'http://localhost:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,
];
