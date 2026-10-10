<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate_number',
        'model',
        'vehicle_type',
        'capacity',
        'warehouse_id',
        'driver_id',
        'mileage',
        'technical_visit_expiry',
        'insurance_expiry',
        'status',
    ];

    protected $casts = [
        'mileage' => 'integer',
        'technical_visit_expiry' => 'date',
        'insurance_expiry' => 'date',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
