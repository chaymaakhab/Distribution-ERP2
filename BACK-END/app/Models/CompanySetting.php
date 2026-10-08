<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'brand_name',
        'ice',
        'rc',
        'if_tax',
        'patente',
        'cnss',
        'capital',
        'address',
        'city',
        'phone',
        'email',
        'website',
        'bank_name',
        'rib',
        'swift',
        'logo_url',
        'default_tva_rate',
    ];

    protected $casts = [
        'capital' => 'decimal:2',
        'default_tva_rate' => 'decimal:2',
    ];
}
