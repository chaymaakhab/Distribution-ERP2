<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryTour extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'driver_id',
        'warehouse_id',
        'vehicle_plate',
        'tour_date',
        'route_name',
        'total_stops',
        'completed_stops',
        'total_amount_to_collect',
        'total_amount_collected',
        'status',
        'departure_time',
        'return_time',
        'notes',
    ];

    protected $casts = [
        'tour_date' => 'date',
        'departure_time' => 'datetime',
        'return_time' => 'datetime',
        'total_stops' => 'integer',
        'completed_stops' => 'integer',
        'total_amount_to_collect' => 'decimal:2',
        'total_amount_collected' => 'decimal:2',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function stops(): HasMany
    {
        return $this->hasMany(DeliveryTourStop::class);
    }
}
