<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'warehouse_id', 'on_hand', 'reserved', 'min_threshold'];

    protected $casts = [
        'on_hand' => 'integer',
        'reserved' => 'integer',
        'min_threshold' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function getAvailableAttribute(): int
    {
        return max(0, $this->on_hand - $this->reserved);
    }
}
