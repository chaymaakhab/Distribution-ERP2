<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommercialCommission extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'commercial_id',
        'customer_id',
        'order_id',
        'invoice_id',
        'commercial_reference',
        'base_amount',
        'commission_rate',
        'commission_amount',
        'status',
        'paid_at',
        'period',
        'notes',
    ];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function commercial()
    {
        return $this->belongsTo(User::class, 'commercial_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
