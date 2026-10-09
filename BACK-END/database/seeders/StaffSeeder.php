<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Warehouse;
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

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone' => null,
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'locale' => 'fr',
                    'warehouse_id' => $warehouseId,
                    'commercial_code' => $commercialCode,
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

        $this->command?->info('Staff seeded. Logins: superadmin@/admin@/depot@/commercial@/preparation@/livreur@/prevendeur@/compta@/terrain@/polyvalent@ hercules-erp.ma — password: "password"');
    }
}
