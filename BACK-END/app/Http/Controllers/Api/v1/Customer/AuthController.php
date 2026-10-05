<?php

namespace App\Http\Controllers\Api\v1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate a customer with email OR phone + password.
     * Route is throttled to protect against repeated attempts.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = $data['identifier'];

        $customer = Customer::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();

        if (! $customer || ! Hash::check($data['password'], $customer->password ?? '')) {
            throw ValidationException::withMessages([
                'identifier' => ['Identifiant ou mot de passe incorrect.'],
            ]);
        }

        if ($customer->status !== 'Actif') {
            throw ValidationException::withMessages([
                'identifier' => ['Ce compte client est désactivé. Contactez votre commercial.'],
            ]);
        }

        $token = $customer->createToken('customer-portal')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->presentCustomer($customer),
            'home' => '/customer/home',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        $customer = $request->user()->load('commercial');

        return response()->json([
            'user' => $this->presentCustomer($customer),
            'home' => '/customer/home',
        ]);
    }

    public static function presentCustomer(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'code' => $customer->code,
            'name' => $customer->name,
            'company' => $customer->company,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'city' => $customer->city,
            'address' => $customer->address,
            'price_tier' => $customer->price_tier,
            'credit_limit' => (float) $customer->credit_limit,
            'locale' => $customer->locale,
            'role' => 'customer',
            'commercial' => $customer->commercial ? [
                'name' => $customer->commercial->name,
                'email' => $customer->commercial->email,
            ] : null,
        ];
    }
}
