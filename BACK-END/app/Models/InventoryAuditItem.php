<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryAuditItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_audit_id',
        'product_id',
        'lot_number',
        'system_quantity',
        'counted_quantity',
        'difference_quantity',
        'unit_cost',
        'total_variance_value',
        'status',
    ];

    protected $casts = [
        'system_quantity' => 'integer',
        'counted_quantity' => 'integer',
        'difference_quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_variance_value' => 'decimal:2',
    ];

    public function inventoryAudit(): BelongsTo
    {
        return $this->belongsTo(InventoryAudit::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
