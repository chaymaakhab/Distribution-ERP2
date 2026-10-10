<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliverySlip extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'order_id',
        'customer_id',
        'warehouse_id',
        'driver_id',
        'delivery_date',
        'total_ht',
        'total_tva',
        'total_ttc',
        'status',
        'receiver_name',
        'signature',
        'notes',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'total_ht' => 'decimal:2',
        'total_tva' => 'decimal:2',
        'total_ttc' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(DeliverySlipItem::class);
    }
}
