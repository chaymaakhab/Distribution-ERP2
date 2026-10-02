<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        return response()->json([
            'id' => 1,
            'name' => 'Amine El Fassi',
            'email' => 'a.elfassi@hercules-erp.ma',
            'roleCode' => 'admin',
            'roleName' => 'Administrateur',
            'allowedModules' => ['/orders', '/products', '/inventory', '/customers', '/purchasing', '/deliveries', '/finance', '/reports', '/settings'],
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
