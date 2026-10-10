<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Warehouse::withCount('stocks');

        if ($request->filled('city')) {
            $query->where('city', $request->input('city'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%")
                    ->orWhere('city', 'like', "%{$q}%");
            });
        }

        $warehouses = $query->get()->map(function ($w) {
            $totalOnHand = (int) $w->stocks()->sum('on_hand');
            $totalReserved = (int) $w->stocks()->sum('reserved');
            return [
                'id' => $w->id,
                'code' => $w->code,
                'name' => $w->name,
                'city' => $w->city,
                'address' => $w->address,
                'lat' => $w->lat ? (float) $w->lat : null,
                'lng' => $w->lng ? (float) $w->lng : null,
                'phone' => $w->phone,
                'manager_name' => $w->manager_name,
                'status' => $w->status,
                'products_count' => $w->stocks_count,
                'stock_on_hand' => $totalOnHand,
                'stock_available' => max(0, $totalOnHand - $totalReserved),
            ];
        });

        return response()->json($warehouses);
    }

    public function show(int $id): JsonResponse
    {
        $warehouse = Warehouse::with(['stocks.product'])->findOrFail($id);
        return response()->json($warehouse);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:warehouses,code',
            'name' => 'required|string',
            'city' => 'required|string',
            'address' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'phone' => 'nullable|string',
            'manager_name' => 'nullable|string',
            'status' => 'nullable|string|in:Actif,Inactif,Maintenance',
        ]);

        $warehouse = Warehouse::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'city' => $validated['city'],
            'address' => $validated['address'] ?? null,
            'lat' => $validated['lat'] ?? null,
            'lng' => $validated['lng'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'manager_name' => $validated['manager_name'] ?? null,
            'status' => $validated['status'] ?? 'Actif',
        ]);

        return response()->json($warehouse, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'city' => 'sometimes|string',
            'address' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'phone' => 'nullable|string',
            'manager_name' => 'nullable|string',
            'status' => 'sometimes|string|in:Actif,Inactif,Maintenance',
        ]);

        $warehouse->update($validated);

        return response()->json($warehouse);
    }

    public function destroy(int $id): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($id);

        if ($warehouse->stocks()->where('on_hand', '>', 0)->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer un dépôt contenant du stock physique.',
            ], 422);
        }

        $warehouse->delete();

        return response()->json(['message' => 'Dépôt supprimé avec succès.']);
    }
}
