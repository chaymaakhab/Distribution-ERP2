<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'contact',
        'phone',
        'email',
        'city',
        'address',
        'ice',
        'rc',
        'products_count',
        'last_order',
        'total_purchases',
        'status',
        'categories',
        'payment_terms',
        'lead_time_days',
    ];

    protected $casts = [
        'total_purchases' => 'decimal:2',
        'products_count' => 'integer',
        'lead_time_days' => 'integer',
        'categories' => 'array',
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function purchaseReceipts()
    {
        return $this->hasMany(PurchaseReceipt::class);
    }
}

