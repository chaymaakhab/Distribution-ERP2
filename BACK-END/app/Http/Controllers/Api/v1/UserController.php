<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles', 'warehouse'])->orderBy('id', 'asc');

        if ($request->filled('role') && $request->query('role') !== 'all') {
            $roleCode = $request->query('role');
            $query->whereHas('roles', function ($q) use ($roleCode) {
                $q->where('code', $roleCode);
            });
        }

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $users = $query->get()->map(function ($u) {
            $rolesList = $u->roles->map(function ($r) {
                return [
                    'code' => $r->code,
                    'name' => $r->name,
                    'is_primary' => (bool) $r->pivot->is_primary,
                ];
            });

            $primary = $u->roles->firstWhere('pivot.is_primary', true) ?? $u->roles->first();

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'avatar' => $u->avatar,
                'locale' => $u->locale ?? 'fr',
                'is_active' => (bool) $u->is_active,
                'warehouse' => $u->warehouse ? [
                    'id' => $u->warehouse->id,
                    'code' => $u->warehouse->code,
                    'name' => $u->warehouse->name,
                    'city' => $u->warehouse->city,
                ] : null,
                'roles' => $rolesList,
                'primary_role' => $primary?->code ?? 'commercial',
                'role' => $primary?->code ?? 'commercial',
                'role_name' => $primary?->name ?? 'Commercial',
                'created_at' => $u->created_at?->format('d/m/Y'),
            ];
        });

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:50',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'roles' => 'required|array|min:1',
            'roles.*' => 'string|exists:roles,code',
            'is_active' => 'nullable|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'warehouse_id' => $validated['warehouse_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'locale' => 'fr',
        ]);

        $roles = Role::whereIn('code', $validated['roles'])->get();
        $syncData = [];
        $first = true;
        foreach ($roles as $r) {
            $syncData[$r->id] = ['is_primary' => $first];
            $first = false;
        }
        $user->roles()->sync($syncData);

        $user->load(['roles', 'warehouse']);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => "sometimes|required|email|unique:users,email,{$id}",
            'password' => 'sometimes|nullable|string|min:6',
            'phone' => 'sometimes|nullable|string|max:50',
            'warehouse_id' => 'sometimes|nullable|exists:warehouses,id',
            'roles' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $data = [
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'phone' => $validated['phone'] ?? $user->phone,
            'warehouse_id' => array_key_exists('warehouse_id', $validated) ? $validated['warehouse_id'] : $user->warehouse_id,
            'is_active' => array_key_exists('is_active', $validated) ? $validated['is_active'] : $user->is_active,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        if (isset($validated['roles'])) {
            $roles = Role::whereIn('code', $validated['roles'])->get();
            $syncData = [];
            $first = true;
            foreach ($roles as $r) {
                $syncData[$r->id] = ['is_primary' => $first];
                $first = false;
            }
            $user->roles()->sync($syncData);
        }

        $user->load(['roles', 'warehouse']);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        // Prevent deleting superadmin
        if ($user->email === 'superadmin@hercules-erp.ma') {
            return response()->json(['message' => 'Impossible de supprimer le compte SuperAdmin principal.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}
