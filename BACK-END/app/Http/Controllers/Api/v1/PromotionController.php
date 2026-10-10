<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Promotion::with(['category', 'product']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        $promotion = Promotion::with(['category', 'product'])->findOrFail($id);
        return response()->json($promotion);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:promotions,code',
            'name' => 'required|string',
            'type' => 'required|string|in:percentage,fixed_amount',
            'discount_value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'category_id' => 'nullable|exists:categories,id',
            'product_id' => 'nullable|exists:products,id',
            'customer_tier' => 'nullable|string',
            'status' => 'nullable|string|in:Actif,Inactif,Expire',
        ]);

        $promotion = Promotion::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'type' => $validated['type'],
            'discount_value' => $validated['discount_value'],
            'min_order_amount' => $validated['min_order_amount'] ?? 0.00,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'category_id' => $validated['category_id'] ?? null,
            'product_id' => $validated['product_id'] ?? null,
            'customer_tier' => $validated['customer_tier'] ?? null,
            'status' => $validated['status'] ?? 'Actif',
        ]);

        return response()->json($promotion->load(['category', 'product']), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|string|in:percentage,fixed_amount',
            'discount_value' => 'sometimes|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'category_id' => 'nullable|exists:categories,id',
            'product_id' => 'nullable|exists:products,id',
            'customer_tier' => 'nullable|string',
            'status' => 'sometimes|string|in:Actif,Inactif,Expire',
        ]);

        $promotion->update($validated);

        return response()->json($promotion->load(['category', 'product']));
    }

    public function destroy(int $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->delete();

        return response()->json(['message' => 'Promotion supprimée.']);
    }
}
