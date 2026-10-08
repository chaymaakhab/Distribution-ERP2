<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReturn extends Model
{
    use HasFactory;

    protected $table = 'returns';

    protected $fillable = [
        'ref',
        'customer_id',
        'order_id',
        'product_id',
        'quantity',
        'amount',
        'reason',
        'condition',
        'restock_approved',
        'status',
        'validated_by_user_id',
        'validated_at',
        'superadmin_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'restock_approved' => 'boolean',
        'validated_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by_user_id');
    }
}
