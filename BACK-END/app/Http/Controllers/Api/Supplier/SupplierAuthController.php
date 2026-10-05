<?php

namespace App\Http\Controllers\Api\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SupplierAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = DB::table('supplier_users')->where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        if ($user->is_blocked) {
            return response()->json(['message' => 'Compte fournisseur bloqué.'], 403);
        }

        DB::table('supplier_users')->where('id', $user->id)->update(['last_login_at' => now()]);

        return response()->json([
            'token' => 'supplier_token_' . $user->id . '_' . bin2hex(random_bytes(8)),
            'user' => [
                'id' => $user->id,
                'supplier_id' => $user->supplier_id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
            ]
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => [
                'id' => 1,
                'supplier_id' => 1,
                'name' => 'Fournisseur Démo SARL',
                'phone' => '+212600000000',
                'email' => 'contact@fournisseur-demo.ma',
                'role' => 'supplier',
                'allowedModules' => ['/dashboard-supplier', '/my-products', '/orders-received', '/quotes', '/invoices-supplier', '/payments-received', '/balance', '/profile'],
            ]
        ]);
    }
}
