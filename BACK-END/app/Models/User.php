<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'commercial_code', 'commission_rate', 'phone', 'password', 'is_active', 'locale', 'avatar', 'warehouse_id', 'company_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'commission_rate' => 'decimal:2',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class)->withPivot('is_primary')->withTimestamps();
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class, 'commercial_id');
    }

    public function createdCustomers()
    {
        return $this->hasMany(Customer::class, 'created_by_user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function commercialVisits()
    {
        return $this->hasMany(CommercialVisit::class, 'commercial_id');
    }

    public function commissions()
    {
        return $this->hasMany(CommercialCommission::class, 'commercial_id');
    }

    public function roleCodes(): array
    {
        return $this->roles->pluck('code')->all();
    }

    public function hasRole(string ...$codes): bool
    {
        foreach ($this->roles as $role) {
            if (in_array($role->code, $codes, true)) {
                return true;
            }
        }

        return false;
    }

    public function primaryRole(): ?Role
    {
        return $this->roles->firstWhere('pivot.is_primary', true)
            ?? $this->roles->first();
    }

    /**
     * Union of the permissions of every assigned role. Role rows may store an
     * explicit permission list; when empty we fall back to the config matrix.
     */
    public function allPermissions(): array
    {
        $perms = [];
        foreach ($this->roles as $role) {
            $rolePerms = $role->permissions;
            if (empty($rolePerms)) {
                $rolePerms = config("permissions.roles.{$role->code}.permissions", []);
            }
            foreach ($rolePerms as $p) {
                $perms[$p] = true;
            }
        }

        return array_keys($perms);
    }

    public function hasPermission(string $permission): bool
    {
        $all = $this->allPermissions();

        if (in_array('*', $all, true)) {
            return true;
        }

        if (in_array($permission, $all, true)) {
            return true;
        }

        // Wildcard on module, e.g. 'products.*' covers 'products.view'.
        $module = Str::before($permission, '.');
        return in_array($module.'.*', $all, true);
    }

    /**
     * Landing route for the user's primary role.
     */
    public function homeRoute(): string
    {
        $primary = $this->primaryRole();
        $code = $primary?->code ?? 'admin';

        return config("permissions.roles.{$code}.home", '/admin/dashboard');
    }
}
