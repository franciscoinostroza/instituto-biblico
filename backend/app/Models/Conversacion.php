<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversacion extends Model
{
    public function participantes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'participantes_conversacion', 'conversacion_id', 'user_id')
                    ->withTimestamps();
    }

    public function mensajes(): HasMany
    {
        return $this->hasMany(Mensaje::class)->orderBy('created_at');
    }

    public function ultimoMensaje(): HasMany
    {
        return $this->hasMany(Mensaje::class)->latest()->limit(1);
    }
}
