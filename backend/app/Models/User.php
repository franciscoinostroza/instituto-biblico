<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'avatar', 'phone', 'active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'active'            => 'boolean',
        ];
    }

    public function isAdmin(): bool          { return $this->role === 'admin'; }
    public function isDocente(): bool        { return $this->role === 'docente'; }
    public function isEstudiante(): bool     { return $this->role === 'estudiante'; }
    public function isEditor(): bool         { return $this->role === 'editor'; }
    public function canEditInstituto(): bool { return $this->isAdmin() || $this->isEditor(); }

    // Relaciones como docente
    public function materiasComoDocente(): HasMany
    {
        return $this->hasMany(Materia::class, 'docente_id');
    }

    // Relaciones como estudiante
    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class, 'estudiante_id');
    }

    public function materiasInscritas(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'inscripciones', 'estudiante_id', 'materia_id')
                    ->withPivot('fecha_inscripcion', 'active')
                    ->withTimestamps();
    }

    public function entregas(): HasMany
    {
        return $this->hasMany(Entrega::class, 'estudiante_id');
    }

    public function intentosExamen(): HasMany
    {
        return $this->hasMany(IntentoExamen::class, 'estudiante_id');
    }

    public function notas(): HasMany
    {
        return $this->hasMany(Nota::class, 'estudiante_id');
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }

    public function conversaciones(): BelongsToMany
    {
        return $this->belongsToMany(Conversacion::class, 'participantes_conversacion', 'user_id', 'conversacion_id')
                    ->withTimestamps();
    }

    public function mensajesEnviados(): HasMany
    {
        return $this->hasMany(Mensaje::class, 'sender_id');
    }

    public function noticiasInstituto(): HasMany
    {
        return $this->hasMany(NoticiaInstituto::class, 'author_id');
    }
}
