<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::with('commercial:id,name')->orderBy('id', 'desc');

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('company', 'like', "%{$q}%")
                  ->orWhere('code', 'like', "%{$q}%")
                  ->orWhere('city', 'like', "%{$q}%")
                  ->orWhere('ice', 'like', "%{$q}%");
            });
        }

        if ($request->filled('tier') && $request->query('tier') !== 'all') {
            $query->where('price_tier', $request->query('tier'));
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        $customers = $query->withCount('orders')->get();

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'city' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
            'ice' => 'nullable|string|max:20',
            'price_tier' => 'nullable|string|in:standard,revendeur,grossiste,chantier',
            'credit_limit' => 'nullable|numeric|min:0',
            'commercial_id' => 'nullable|exists:users,id',
        ]);

        $nextNum = Customer::count() + 1;
        $code = 'CLI-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $customer = Customer::create([
            'code' => $code,
            'name' => $validated['name'] ?? $validated['company'],
            'company' => $validated['company'],
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
            'commercial_id' => $validated['commercial_id'] ?? null,
        ]);

        return response()->json($customer, 201);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'company' => 'sometimes|required|string|max:255',
            'name' => 'sometimes|nullable|string|max:255',
            'phone' => 'sometimes|nullable|string|max:50',
            'whatsapp' => 'sometimes|nullable|string|max:50',
            'city' => 'sometimes|required|string|max:100',
            'address' => 'sometimes|nullable|string|max:255',
            'ice' => 'sometimes|nullable|string|max:20',
            'price_tier' => 'sometimes|string|in:standard,revendeur,grossiste,chantier',
            'credit_limit' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|string|in:Actif,Bloqué,À surveiller',
            'commercial_id' => 'sometimes|nullable|exists:users,id',
        ]);

        $customer->update($validated);

        return response()->json($customer);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json(['message' => 'Client supprimé avec succès']);
    }
}
