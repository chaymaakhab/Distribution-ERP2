<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'brand_name',
        'ice',
        'rc',
        'if_tax',
        'patente',
        'cnss',
        'email',
        'phone',
        'city',
        'address',
        'logo_url',
        'admin_user_id',
        'subscription_plan',
        'subscription_status',
        'subscription_start_date',
        'subscription_end_date',
        'subscription_price',
        'subscription_billing_cycle',
        'max_users',
        'max_warehouses',
        'status',
    ];

    protected $casts = [
        'subscription_price' => 'decimal:2',
        'subscription_start_date' => 'date',
        'subscription_end_date' => 'date',
        'max_users' => 'integer',
        'max_warehouses' => 'integer',
    ];

    protected $appends = [
        'days_remaining',
        'users_count',
        'warehouses_count',
        'is_expired',
    ];

    public function adminUser()
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function getDaysRemainingAttribute(): int
    {
        if (!$this->subscription_end_date) {
            return 0;
        }
        $end = Carbon::parse($this->subscription_end_date)->endOfDay();
        $now = Carbon::now();
        if ($now->greaterThan($end)) {
            return 0;
        }
        return (int) $now->diffInDays($end);
    }

    public function getIsExpiredAttribute(): bool
    {
        if (!$this->subscription_end_date) {
            return false;
        }
        return Carbon::now()->greaterThan(Carbon::parse($this->subscription_end_date)->endOfDay());
    }

    public function getUsersCountAttribute(): int
    {
        return $this->users()->count();
    }

    public function getWarehousesCountAttribute(): int
    {
        return $this->warehouses()->count();
    }
}
