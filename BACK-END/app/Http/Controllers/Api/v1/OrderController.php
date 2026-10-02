<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::orderBy('id', 'desc')->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ref' => 'required|string',
            'customer' => 'required|string',
            'city' => 'required|string',
            'date' => 'required|string',
            'total' => 'required|string',
            'status' => 'required|string',
            'source' => 'required|string',
            'client_generated_uuid' => 'nullable|string',
        ]);

        $order = Order::create([
            'ref' => $validated['ref'],
            'customer_id' => 1, // Fallback demo customer
            'city' => $validated['city'],
            'date' => $validated['date'],
            'total' => (float) str_replace([' ', ','], ['', '.'], $validated['total']),
            'status' => $validated['status'],
            'source' => $validated['source'],
            'client_generated_uuid' => $validated['client_generated_uuid'] ?? null,
        ]);

        return response()->json($order, 201);
    }

    public function updateStatus(Request $request, $ref)
    {
        $request->validate(['status' => 'required|string']);
        $order = Order::where('ref', $ref)->firstOrFail();
        $order->status = $request->input('status');
        $order->save();

        return response()->json($order);
    }
}
