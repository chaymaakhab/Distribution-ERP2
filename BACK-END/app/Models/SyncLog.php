<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyncLog extends Model
{
    use HasFactory;

    protected $fillable = ['client_generated_uuid', 'action', 'status', 'response_payload'];

    protected $casts = [
        'response_payload' => 'array',
    ];
}
