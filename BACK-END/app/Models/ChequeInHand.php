<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChequeInHand extends Model
{
    use HasFactory;

    protected $table = 'cheques_in_hand';

    protected $fillable = [
        'ref',
        'customer_id',
        'warehouse_id',
        'payment_id',
        'bank',
        'amount',
        'due_date',
        'doc_type',
        'status',
        'remittance_ref',
        'deposit_date',
        'cleared_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'deposit_date' => 'date',
        'cleared_date' => 'date',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
