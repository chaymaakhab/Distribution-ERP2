<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::with([
            'commercial:id,name,email,commercial_code,commission_rate',
            'creator:id,name,email'
        ])->orderBy('id', 'desc');

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('company', 'like', "%{$q}%")
                  ->orWhere('code', 'like', "%{$q}%")
                  ->orWhere('city', 'like', "%{$q}%")
                  ->orWhere('ice', 'like', "%{$q}%")
                  ->orWhere('commercial_reference', 'like', "%{$q}%");
            });
        }

        if ($request->filled('tier') && $request->query('tier') !== 'all') {
            $query->where('price_tier', $request->query('tier'));
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('commercial_id') && $request->query('commercial_id') !== 'all') {
            $query->where('commercial_id', $request->query('commercial_id'));
        }

        $customers = $query->withCount('orders')->get();

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:customers,email',
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'city' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
            'ice' => 'nullable|string|max:20',
            'price_tier' => 'nullable|string|in:standard,revendeur,grossiste,chantier',
            'credit_limit' => 'nullable|numeric|min:0',
            'commercial_id' => 'nullable|exists:users,id',
            'commission_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $currentUser = $request->user();

        // If creator is a commercial and no commercial_id was explicitly provided, attribute to current commercial
        $commercialId = $validated['commercial_id'] ?? null;
        if (!$commercialId && $currentUser && $currentUser->hasRole('commercial')) {
            $commercialId = $currentUser->id;
        }

        $commercialRef = null;
        $commissionPercentage = $validated['commission_percentage'] ?? 5.00;

        if ($commercialId) {
            $commercial = User::find($commercialId);
            if ($commercial) {
                $commercialRef = $commercial->commercial_code ?: ('COM-' . str_pad($commercial->id, 3, '0', STR_PAD_LEFT));
                if (!isset($validated['commission_percentage'])) {
                    $commissionPercentage = $commercial->commission_rate ?? 5.00;
                }
            }
        }

        $nextNum = Customer::count() + 1;
        $code = 'CLI-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $password = null;
        if (!empty($validated['password'])) {
            $password = Hash::make($validated['password']);
        } elseif (!empty($validated['email'])) {
            $password = Hash::make('client1234');
        }

        $customer = Customer::create([
            'code' => $code,
            'name' => $validated['name'] ?? $validated['company'],
            'company' => $validated['company'],
            'email' => $validated['email'] ?? null,
            'password' => $password,
            'phone' => $validated['phone'] ?? null,
            'whatsapp' => $validated['whatsapp'] ?? null,
            'city' => $validated['city'],
            'address' => $validated['address'] ?? null,
            'ice' => $validated['ice'] ?? null,
            'price_tier' => $validated['price_tier'] ?? 'revendeur',
            'credit_limit' => $validated['credit_limit'] ?? 50000.00,
            'current_balance' => 0.00,
            'overdue_amount' => 0.00,
            'status' => 'Actif',
            'commercial_id' => $commercialId,
            'commercial_reference' => $commercialRef,
            'commission_percentage' => $commissionPercentage,
            'created_by_user_id' => $currentUser?->id,
        ]);

        $customer->load([
            'commercial:id,name,email,commercial_code,commission_rate',
            'creator:id,name,email'
        ]);

        return response()->json($customer, 201);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'company' => 'sometimes|required|string|max:255',
            'name' => 'sometimes|nullable|string|max:255',
            'email' => "sometimes|nullable|email|unique:customers,email,{$id}",
            'password' => 'sometimes|nullable|string|min:6',
            'phone' => 'sometimes|nullable|string|max:50',
            'whatsapp' => 'sometimes|nullable|string|max:50',
            'city' => 'sometimes|required|string|max:100',
            'address' => 'sometimes|nullable|string|max:255',
            'ice' => 'sometimes|nullable|string|max:20',
            'price_tier' => 'sometimes|string|in:standard,revendeur,grossiste,chantier',
            'credit_limit' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|string|in:Actif,Bloqué,À surveiller',
            'commercial_id' => 'sometimes|nullable|exists:users,id',
            'commercial_reference' => 'sometimes|nullable|string|max:50',
            'commission_percentage' => 'sometimes|nullable|numeric|min:0|max:100',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // If commercial changed, re-sync reference and commission rate if not explicitly supplied
        if (array_key_exists('commercial_id', $validated)) {
            $newCommercialId = $validated['commercial_id'];
            if ($newCommercialId) {
                $commercial = User::find($newCommercialId);
                if ($commercial) {
                    if (!isset($validated['commercial_reference'])) {
                        $validated['commercial_reference'] = $commercial->commercial_code ?: ('COM-' . str_pad($commercial->id, 3, '0', STR_PAD_LEFT));
                    }
                    if (!isset($validated['commission_percentage'])) {
                        $validated['commission_percentage'] = $commercial->commission_rate ?? 5.00;
                    }
                }
            } else {
                $validated['commercial_reference'] = null;
            }
        }

        $customer->update($validated);
        $customer->load([
            'commercial:id,name,email,commercial_code,commission_rate',
            'creator:id,name,email'
        ]);

        return response()->json($customer);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json(['message' => 'Client supprimé avec succès']);
    }
}
