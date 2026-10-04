<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        $role = request()->query('role', 'admin');

        $roleConfig = [
            'admin' => [
                'code' => 'admin',
                'name' => 'Super Admin',
                'allowedModules' => ['/', '/orders', '/products', '/inventory', '/customers', '/purchasing', '/deliveries', '/finance', '/reports', '/settings']
            ],
            'warehouse' => [
                'code' => 'warehouse',
                'name' => 'Responsable Dépôt',
                'allowedModules' => ['/', '/inventory', '/deliveries', '/purchasing']
            ],
            'commercial' => [
                'code' => 'commercial',
                'name' => 'Commercial',
                'allowedModules' => ['/', '/customers', '/orders', '/products', '/finance']
            ],
            'preparateur' => [
                'code' => 'preparateur',
                'name' => 'Préparateur',
                'allowedModules' => ['/', '/orders', '/inventory']
            ],
            'driver' => [
                'code' => 'driver',
                'name' => 'Livreur / Chauffeur',
                'allowedModules' => ['/', '/deliveries', '/finance']
            ],
            'comptable' => [
                'code' => 'comptable',
                'name' => 'Comptable',
                'allowedModules' => ['/', '/finance', '/reports', '/customers']
            ],
            'client' => [
                'code' => 'client',
                'name' => 'Client',
                'allowedModules' => ['/', '/products', '/orders']
            ],
        ];

        $currentRole = $roleConfig[$role] ?? $roleConfig['admin'];

        return response()->json([
            'id' => 1,
            'name' => 'Amine El Fassi',
            'email' => 'a.elfassi@gestionerp.ma',
            'roleCode' => $currentRole['code'],
            'roleName' => $currentRole['name'],
            'allowedModules' => $currentRole['allowedModules'],
        ]);
    }

    public function roles()
    {
        return response()->json([
            ['code' => 'admin', 'name' => 'Administrateur', 'description' => 'Accès complet', 'modules' => ['/orders', '/products', '/inventory', '/customers', '/purchasing', '/deliveries', '/finance', '/reports', '/settings']],
            ['code' => 'commercial', 'name' => 'Commercial', 'description' => 'Gestion clients et commandes', 'modules' => ['/orders', '/products', '/customers']],
            ['code' => 'finance', 'name' => 'Finance', 'description' => 'Gestion factures et trésorerie', 'modules' => ['/finance', '/customers', '/reports']],
            ['code' => 'warehouse', 'name' => 'Responsable Dépôt', 'description' => 'Gestion des stocks', 'modules' => ['/inventory', '/products', '/purchasing']],
            ['code' => 'driver', 'name' => 'Chauffeur / Livreur', 'description' => 'Suivi des livraisons', 'modules' => ['/deliveries']],
        ]);
    }
}
