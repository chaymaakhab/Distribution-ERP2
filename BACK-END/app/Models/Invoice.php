<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = ['ref', 'order_id', 'customer_id', 'total_ttc', 'paid_amount', 'status', 'due_date'];

    protected $casts = [
        'total_ttc' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function getRemainingAttribute(): float
    {
        return (float) $this->total_ttc - (float) $this->paid_amount;
    }
}
