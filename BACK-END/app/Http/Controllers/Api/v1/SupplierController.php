<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::orderBy('id', 'desc');

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('code', 'like', "%{$q}%")
                  ->orWhere('contact', 'like', "%{$q}%")
                  ->orWhere('city', 'like', "%{$q}%")
                  ->orWhere('ice', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status') && $request->query('status') !== 'Tous' && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        $suppliers = $query->get();

        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'city' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
            'ice' => 'nullable|string|max:20',
            'rc' => 'nullable|string|max:50',
            'categories' => 'nullable|array',
            'payment_terms' => 'nullable|string|max:255',
            'lead_time_days' => 'nullable|integer|min:1',
            'status' => 'nullable|string|in:Actif,Inactif,Suspendu',
        ]);

        $nextNum = Supplier::count() + 1;
        $code = 'FRN-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $supplier = Supplier::create([
            'code' => $code,
            'name' => $validated['name'],
            'contact' => $validated['contact'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'city' => $validated['city'],
            'address' => $validated['address'] ?? null,
            'ice' => $validated['ice'] ?? null,
            'rc' => $validated['rc'] ?? null,
            'products_count' => 0,
            'last_order' => date('d M Y'),
            'total_purchases' => 0.00,
            'status' => $validated['status'] ?? 'Actif',
            'categories' => $validated['categories'] ?? [],
            'payment_terms' => $validated['payment_terms'] ?? '30 jours date facture',
            'lead_time_days' => $validated['lead_time_days'] ?? 5,
        ]);

        return response()->json($supplier, 201);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'contact' => 'sometimes|nullable|string|max:255',
            'phone' => 'sometimes|nullable|string|max:50',
            'email' => 'sometimes|nullable|email|max:255',
            'city' => 'sometimes|required|string|max:100',
            'address' => 'sometimes|nullable|string|max:255',
            'ice' => 'sometimes|nullable|string|max:20',
            'rc' => 'sometimes|nullable|string|max:50',
            'categories' => 'sometimes|nullable|array',
            'payment_terms' => 'sometimes|nullable|string|max:255',
            'lead_time_days' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string|in:Actif,Inactif,Suspendu',
        ]);

        $supplier->update($validated);

        return response()->json($supplier);
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return response()->json(['message' => 'Fournisseur supprimé avec succès']);
    }
}
