<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentoInstituto extends Model
{
    protected $table = 'documentos_instituto';

    protected $fillable = ['title', 'description', 'file_path', 'url', 'category'];
}
