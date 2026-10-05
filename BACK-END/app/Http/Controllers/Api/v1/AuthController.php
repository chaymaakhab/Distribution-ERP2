<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Staff login (email OR phone + password). Route is throttled.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = $data['identifier'];

        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Identifiant ou mot de passe incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'identifier' => ['Ce compte est désactivé.'],
            ]);
        }

        $user->load('roles');
        $token = $user->createToken('staff')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->present($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        $user = $request->user('staff')->load('roles', 'warehouse');

        return response()->json(['user' => $this->present($user)]);
    }

    /**
     * Switch the primary role for users holding multiple roles.
     */
    public function switchRole(Request $request)
    {
        $data = $request->validate(['role' => ['required', 'string']]);

        /** @var User $user */
        $user = $request->user('staff');

        if (! $user->hasRole($data['role'])) {
            return response()->json(['message' => 'Rôle non autorisé pour cet utilisateur.'], 403);
        }

        foreach ($user->roles as $role) {
            $role->pivot->is_primary = $role->code === $data['role'];
            $role->pivot->save();
        }

        return response()->json(['user' => $this->present($user->load('roles'))]);
    }

    public function roles()
    {
        $matrix = config('permissions.roles');
        $out = [];
        foreach ($matrix as $code => $def) {
            $out[] = [
                'code' => $code,
                'name' => $def['name'],
                'home' => $def['home'],
                'permissions' => $def['permissions'],
            ];
        }

        return response()->json(['data' => $out]);
    }

    public function present(User $user): array
    {
        $roles = $user->roles->map(fn ($r) => [
            'code' => $r->code,
            'name' => $r->name ?: config("permissions.roles.{$r->code}.name", $r->code),
            'home' => $r->homeRoute(),
            'is_primary' => (bool) $r->pivot->is_primary,
        ])->values();

        $primary = $user->primaryRole();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'locale' => $user->locale,
            'warehouse' => $user->warehouse ? [
                'id' => $user->warehouse->id,
                'code' => $user->warehouse->code,
                'name' => $user->warehouse->name,
                'city' => $user->warehouse->city,
            ] : null,
            'roles' => $roles,
            'primary_role' => $primary?->code,
            'permissions' => $user->allPermissions(),
            'home' => $user->homeRoute(),
        ];
    }
}
