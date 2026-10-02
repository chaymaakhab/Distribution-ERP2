<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'name', 'category_id', 'sku', 'price', 'vat_rate', 'packaging', 'status'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
