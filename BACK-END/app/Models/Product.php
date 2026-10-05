<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'name', 'description', 'image', 'category_id', 'sku',
        'price', 'vat_rate', 'packaging', 'unit', 'status',
        'visible_portal', 'min_order_qty',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'vat_rate' => 'integer',
        'visible_portal' => 'boolean',
        'min_order_qty' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function prices()
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    /**
     * Unit price HT applicable to a given customer price tier.
     * Falls back to the base price when the tier has no dedicated grid price.
     */
    public function priceForTier(?string $tier): float
    {
        if ($tier) {
            foreach ($this->prices as $price) {
                if ($price->tier === $tier) {
                    return (float) $price->price;
                }
            }
        }

        return (float) $this->price;
    }
}
