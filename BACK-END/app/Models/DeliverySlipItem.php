<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliverySlipItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_slip_id',
        'product_id',
        'quantity_ordered',
        'quantity_delivered',
        'unit_price',
        'total',
        'notes',
    ];

    protected $casts = [
        'quantity_ordered' => 'integer',
        'quantity_delivered' => 'integer',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function deliverySlip(): BelongsTo
    {
        return $this->belongsTo(DeliverySlip::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
