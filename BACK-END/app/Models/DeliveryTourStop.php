<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryTourStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_tour_id',
        'order_id',
        'customer_id',
        'stop_order',
        'address',
        'city',
        'amount_to_collect',
        'amount_collected',
        'payment_method',
        'cheque_number',
        'cheque_bank',
        'receiver_name',
        'signature',
        'proof_photo',
        'status',
        'failed_reason',
        'delivered_at',
    ];

    protected $casts = [
        'stop_order' => 'integer',
        'amount_to_collect' => 'decimal:2',
        'amount_collected' => 'decimal:2',
        'delivered_at' => 'datetime',
    ];

    public function deliveryTour(): BelongsTo
    {
        return $this->belongsTo(DeliveryTour::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
