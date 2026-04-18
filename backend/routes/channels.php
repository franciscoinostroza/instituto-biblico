<?php

use Illuminate\Support\Facades\Broadcast;

// Canal privado por usuario — para mensajes y notificaciones en tiempo real
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
