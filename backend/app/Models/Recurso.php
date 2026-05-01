<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Recurso extends Model
{
    protected $fillable = [
        'materia_id', 'title', 'description', 'type', 'file_path', 'url', 'unidad', 'orden',
    ];

    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) return null;
        try {
            return Storage::disk('s3')->temporaryUrl($this->file_path, now()->addHours(2));
        } catch (\Throwable $e) {
            return Storage::disk('s3')->url($this->file_path);
        }
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }
}
