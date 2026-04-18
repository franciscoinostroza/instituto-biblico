<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Instituto extends Model
{
    protected $fillable = [
        'name', 'logo', 'description', 'address', 'phone', 'email', 'website',
    ];
}
