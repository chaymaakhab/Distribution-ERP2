<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'warehouse_id',
        'audited_by_user_id',
        'audit_date',
        'status',
        'total_items_counted',
        'total_discrepancies',
        'notes',
    ];

    protected $casts = [
        'audit_date' => 'date',
        'total_items_counted' => 'integer',
        'total_discrepancies' => 'integer',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function auditedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'audited_by_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventoryAuditItem::class);
    }
}
