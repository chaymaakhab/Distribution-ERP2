<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'code', 'name', 'company', 'ice', 'city', 'address', 'lat', 'lng',
        'phone', 'whatsapp', 'email', 'password', 'price_tier', 'credit_limit',
        'current_balance', 'overdue_amount',
        'status', 'locale', 'commercial_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'credit_limit' => 'decimal:2',
            'current_balance' => 'decimal:2',
            'overdue_amount' => 'decimal:2',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function commercial()
    {
        return $this->belongsTo(User::class, 'commercial_id');
    }
}
