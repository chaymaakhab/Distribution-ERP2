<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommercialVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'commercial_id',
        'customer_id',
        'visit_date',
        'visit_type',
        'status',
        'checkin_lat',
        'checkin_lng',
        'checkin_time',
        'checkout_time',
        'amount_collected',
        'order_id',
        'notes',
        'next_action',
        'next_visit_date',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'next_visit_date' => 'date',
        'checkin_time' => 'datetime',
        'checkout_time' => 'datetime',
        'checkin_lat' => 'decimal:7',
        'checkin_lng' => 'decimal:7',
        'amount_collected' => 'decimal:2',
    ];

    public function commercial(): BelongsTo
    {
        return $this->belongsTo(User::class, 'commercial_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
