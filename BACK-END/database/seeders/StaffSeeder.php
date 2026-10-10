<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Customer;
use App\Models\CommercialCommission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $matrix = config('permissions.roles');

        // Roles.
        foreach ($matrix as $code => $def) {
            Role::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $def['name'],
                    'description' => null,
                    'permissions' => $def['permissions'],
                ]
            );
        }

        $casa = Warehouse::firstWhere('code', 'DEP-01');

        // One demo user per role. Password: password
        $users = [
            ['superadmin', 'Super Admin', 'superadmin@hercules-erp.ma', null, null, null],
            ['admin', 'Amine El Fassi', 'admin@hercules-erp.ma', null, null, null],
            ['warehouse', 'Nadia El Amrani', 'depot@hercules-erp.ma', $casa?->id, null, null],
            ['commercial', 'Youssef Bennani', 'commercial@hercules-erp.ma', null, 'COM-001', 5.00],
            ['preparation', 'Karim Ouazzani', 'preparation@hercules-erp.ma', $casa?->id, null, null],
            ['delivery', 'Mehdi Lahlou', 'livreur@hercules-erp.ma', $casa?->id, null, null],
            ['pre_seller', 'Hamid El Meskini (Livreur-pré-vendeur)', 'prevendeur@hercules-erp.ma', $casa?->id, 'COM-003', 3.50],
            ['accounting', 'Sofia Cherkaoui', 'compta@hercules-erp.ma', null, null, null],
        ];

        foreach ($users as [$roleCode, $name, $email, $warehouseId, $commercialCode, $commRate]) {
            $role = Role::where('code', $roleCode)->first();

            $existing = User::where('email', $email)->first();
            $resolvedCode = $existing?->commercial_code;

            if ($commercialCode) {
                $codeTaken = User::where('commercial_code', $commercialCode)
                    ->when($existing, fn($q) => $q->where('id', '!=', $existing->id))
                    ->exists();

                if (!$codeTaken) {
                    $resolvedCode = $commercialCode;
                } elseif (!$resolvedCode) {
                    $maxNum = User::whereNotNull('commercial_code')
                        ->pluck('commercial_code')
                        ->map(fn($c) => preg_match('/COM-(\d+)/', $c, $m) ? (int)$m[1] : 0)
                        ->max() ?: 0;
                    $resolvedCode = 'COM-' . str_pad($maxNum + 1, 3, '0', STR_PAD_LEFT);
                }
            }

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone' => null,
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'locale' => 'fr',
                    'warehouse_id' => $warehouseId,
                    'commercial_code' => $resolvedCode,
                    'commission_rate' => $commRate ?? 5.00,
                ]
            );

            $user->roles()->syncWithoutDetaching([
                $role->id => ['is_primary' => true],
            ]);
        }

        // A multi-role demo user: Commercial + Livreur.
        $commercial = Role::where('code', 'commercial')->first();
        $delivery = Role::where('code', 'delivery')->first();
        $warehouseRole = Role::where('code', 'warehouse')->first();
        $prepRole = Role::where('code', 'preparation')->first();

        $multi = User::updateOrCreate(
            ['email' => 'terrain@hercules-erp.ma'],
            [
                'name' => 'Rachid Multi-rôle',
                'password' => Hash::make('password'),
                'is_active' => true,
                'locale' => 'fr',
                'warehouse_id' => $casa?->id,
            ]
        );
        $multi->roles()->sync([
            $commercial->id => ['is_primary' => true],
            $delivery->id => ['is_primary' => false],
        ]);

        // Responsable dépôt + Préparateur + Livreur polyvalent
        $polyvalent = User::updateOrCreate(
            ['email' => 'polyvalent@hercules-erp.ma'],
            [
                'name' => 'Tariq Polyvalent (Dépôt + Prépa + Livreur)',
                'password' => Hash::make('password'),
                'is_active' => true,
                'locale' => 'fr',
                'warehouse_id' => $casa?->id,
            ]
        );
        $polyvalent->roles()->sync([
            $warehouseRole->id => ['is_primary' => true],
            $prepRole->id => ['is_primary' => false],
            $delivery->id => ['is_primary' => false],
        ]);

        // Seed initial commercial commissions if empty
        $commUser = User::where('commercial_code', 'COM-001')->first();
        $sampleCustomer = Customer::where('commercial_id', $commUser?->id)->first() ?? Customer::first();
        if ($commUser && $sampleCustomer && CommercialCommission::count() == 0) {
            CommercialCommission::create([
                'commercial_id' => $commUser->id,
                'customer_id' => $sampleCustomer->id,
                'commercial_reference' => $commUser->commercial_code ?? 'COM-001',
                'base_amount' => 24500.00,
                'commission_rate' => 5.00,
                'commission_amount' => 1225.00,
                'status' => 'validated',
                'period' => date('Y-m'),
                'notes' => 'Commission sur livraison validée',
            ]);
            CommercialCommission::create([
                'commercial_id' => $commUser->id,
                'customer_id' => $sampleCustomer->id,
                'commercial_reference' => $commUser->commercial_code ?? 'COM-001',
                'base_amount' => 18000.00,
                'commission_rate' => 5.00,
                'commission_amount' => 900.00,
                'status' => 'paid',
                'paid_at' => now(),
                'period' => date('Y-m'),
                'notes' => 'Règlement commission validé par Super Admin',
            ]);
        }

        $this->command?->info('Staff seeded. Logins: superadmin@/admin@/depot@/commercial@/preparation@/livreur@/prevendeur@/compta@/terrain@/polyvalent@ hercules-erp.ma — password: "password"');
    }
}
