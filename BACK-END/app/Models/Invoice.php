<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref', 'order_id', 'customer_id', 'warehouse_id', 'total_ht', 'tva_rate',
        'tva_amount', 'total_ttc', 'timbre_fiscal', 'payment_method', 'paid_amount',
        'status', 'due_date', 'notes',
    ];

    protected $casts = [
        'total_ht' => 'decimal:2',
        'tva_rate' => 'decimal:2',
        'tva_amount' => 'decimal:2',
        'total_ttc' => 'decimal:2',
        'timbre_fiscal' => 'decimal:2',
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

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function creditNotes()
    {
        return $this->hasMany(CreditNote::class);
    }

    public function getRemainingAttribute(): float
    {
        return (float) $this->total_ttc - (float) $this->paid_amount;
    }
}

