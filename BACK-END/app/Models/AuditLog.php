<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'action', 'subject_type', 'subject_id', 'properties', 'ip_address',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record a critical action.
     */
    public static function record(
        string $action,
        ?Model $subject = null,
        array $properties = [],
        ?int $userId = null,
        ?string $ip = null,
    ): self {
        return static::create([
            'user_id' => $userId ?? auth('staff')->id(),
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'properties' => $properties ?: null,
            'ip_address' => $ip ?? request()?->ip(),
        ]);
    }
}
