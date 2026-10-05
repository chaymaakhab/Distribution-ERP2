<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'name', 'description', 'permissions'];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('is_primary')->withTimestamps();
    }

    /**
     * Effective permission list: explicit DB value, else the config matrix.
     */
    public function effectivePermissions(): array
    {
        return ! empty($this->permissions)
            ? $this->permissions
            : config("permissions.roles.{$this->code}.permissions", []);
    }

    public function homeRoute(): string
    {
        return config("permissions.roles.{$this->code}.home", '/admin/dashboard');
    }
}
