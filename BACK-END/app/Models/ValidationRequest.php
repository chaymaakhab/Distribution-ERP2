<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ValidationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'ref',
        'op_type',
        'priority',
        'order_ref',
        'client_name',
        'depot_name',
        'requester_name',
        'requester_role',
        'product_name',
        'qty',
        'amount',
        'motif',
        'notes',
        'status',
        'arbitrated_by',
        'arbitrated_at',
        'decision_motif',
        'decision_action',
    ];

    protected $casts = [
        'qty' => 'float',
        'amount' => 'float',
        'arbitrated_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
