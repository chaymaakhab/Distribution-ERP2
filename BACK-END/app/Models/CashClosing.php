<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashClosing extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'warehouse_id',
        'closed_by_user_id',
        'closing_date',
        'cash_theoretical',
        'cash_counted',
        'cash_difference',
        'cheques_count',
        'cheques_total',
        'effects_count',
        'effects_total',
        'total_collected',
        'status',
        'justification_notes',
        'validated_by_user_id',
        'validated_at',
    ];

    protected $casts = [
        'closing_date' => 'date',
        'cash_theoretical' => 'decimal:2',
        'cash_counted' => 'decimal:2',
        'cash_difference' => 'decimal:2',
        'cheques_count' => 'integer',
        'cheques_total' => 'decimal:2',
        'effects_count' => 'integer',
        'effects_total' => 'decimal:2',
        'total_collected' => 'decimal:2',
        'validated_at' => 'datetime',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by_user_id');
    }

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by_user_id');
    }
}
