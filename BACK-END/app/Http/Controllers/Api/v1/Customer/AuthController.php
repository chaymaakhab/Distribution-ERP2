<?php

namespace App\Http\Controllers\Api\v1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
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
            'user' => $this->presentCustomer($customer->load('commercial')),
            'home' => '/customer/home',
        ]);
    }

    /**
     * Self-registration for B2B Customers.
     * The customer can select their preferred commercial or supply their referral code.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:customers,email'],
            'phone' => ['required', 'string', 'max:50', 'unique:customers,phone'],
            'password' => ['required', 'string', 'min:6'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'ice' => ['nullable', 'string', 'max:20'],
            'commercial_id' => ['nullable', 'exists:users,id'],
            'commercial_code' => ['nullable', 'string', 'max:50'],
        ]);

        $commercialId = $data['commercial_id'] ?? null;
        $commercialRef = null;
        $commissionRate = 5.00;

        if ($commercialId) {
            $comm = User::find($commercialId);
            if ($comm) {
                $commercialRef = $comm->commercial_code ?: ('COM-' . str_pad($comm->id, 3, '0', STR_PAD_LEFT));
                $commissionRate = $comm->commission_rate ?? 5.00;
            }
        } elseif (!empty($data['commercial_code'])) {
            $comm = User::where('commercial_code', trim($data['commercial_code']))->first();
            if ($comm) {
                $commercialId = $comm->id;
                $commercialRef = $comm->commercial_code;
                $commissionRate = $comm->commission_rate ?? 5.00;
            }
        }

        $nextNum = Customer::count() + 1;
        $code = 'CLI-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $customer = Customer::create([
            'code' => $code,
            'name' => $data['name'],
            'company' => !empty($data['company']) ? $data['company'] : $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => Hash::make($data['password']),
            'city' => $data['city'],
            'address' => $data['address'] ?? null,
            'ice' => $data['ice'] ?? null,
            'price_tier' => 'standard',
            'credit_limit' => 20000.00,
            'current_balance' => 0.00,
            'overdue_amount' => 0.00,
            'status' => 'Actif',
            'commercial_id' => $commercialId,
            'commercial_reference' => $commercialRef,
            'commission_percentage' => $commissionRate,
        ]);

        $token = $customer->createToken('customer-portal')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->presentCustomer($customer->load('commercial')),
            'home' => '/customer/home',
            'message' => 'Compte créé avec succès ! Bienvenue sur votre espace B2B.',
        ], 201);
    }

    /**
     * List active commercials that clients can select from during registration or in profile.
     */
    public function commercials()
    {
        $commercials = User::whereHas('roles', function ($q) {
            $q->where('code', 'commercial');
        })
        ->where('is_active', true)
        ->select('id', 'name', 'email', 'phone', 'commercial_code', 'commission_rate')
        ->get();

        return response()->json($commercials);
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
            'ice' => $customer->ice,
            'price_tier' => $customer->price_tier,
            'credit_limit' => (float) $customer->credit_limit,
            'current_balance' => (float) $customer->current_balance,
            'locale' => $customer->locale,
            'role' => 'customer',
            'commercial_reference' => $customer->commercial_reference,
            'commission_percentage' => (float) $customer->commission_percentage,
            'commercial' => $customer->commercial ? [
                'id' => $customer->commercial->id,
                'name' => $customer->commercial->name,
                'email' => $customer->commercial->email,
                'phone' => $customer->commercial->phone,
                'commercial_code' => $customer->commercial->commercial_code,
            ] : null,
        ];
    }
}
