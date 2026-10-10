<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PickingList extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'order_id',
        'warehouse_id',
        'preparator_id',
        'status',
        'started_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function preparator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'preparator_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PickingItem::class);
    }
}
