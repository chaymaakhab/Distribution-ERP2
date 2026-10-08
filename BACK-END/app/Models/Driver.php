<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'cin',
        'license_number',
        'driver_type', // depot_to_client, depot_to_depot, pre_seller
        'warehouse_id',
        'assigned_route',
        'vehicle_model',
        'vehicle_plate',
        'capacity',
        'status', // disponible, en_tournee, en_transit, en_repos
        'current_mission',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function tours()
    {
        return $this->hasMany(DeliveryTour::class);
    }

    public function transfers()
    {
        return $this->hasMany(StockTransfer::class);
    }

    public function vehicle()
    {
        return $this->hasOne(Vehicle::class);
    }
}

