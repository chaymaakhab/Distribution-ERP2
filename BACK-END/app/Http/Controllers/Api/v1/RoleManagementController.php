<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'code' => $role->code,
                'name' => $role->name ?: config("permissions.roles.{$role->code}.name", $role->code),
                'description' => $role->description,
                'permissions' => $role->effectivePermissions(),
                'users_count' => $role->users_count,
            ];
        });

        return response()->json($roles);
    }

    public function updatePermissions(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        $role = Role::findOrFail($id);
        $role->update([
            'permissions' => $validated['permissions'],
        ]);

        return response()->json([
            'message' => 'Permissions du rôle mises à jour avec succès.',
            'role' => [
                'id' => $role->id,
                'code' => $role->code,
                'name' => $role->name,
                'permissions' => $role->effectivePermissions(),
            ],
        ]);
    }
}
