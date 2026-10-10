<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PickingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'picking_list_id',
        'product_id',
        'location_bin',
        'requested_quantity',
        'prepared_quantity',
        'scanned_barcode',
        'status',
    ];

    protected $casts = [
        'requested_quantity' => 'integer',
        'prepared_quantity' => 'integer',
    ];

    public function pickingList(): BelongsTo
    {
        return $this->belongsTo(PickingList::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
