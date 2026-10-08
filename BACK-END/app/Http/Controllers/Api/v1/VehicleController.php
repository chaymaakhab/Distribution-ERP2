<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::with(['warehouse', 'driver']);

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|unique:vehicles,plate_number',
            'model' => 'required|string',
            'vehicle_type' => 'nullable|string',
            'capacity' => 'nullable|string',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'driver_id' => 'nullable|exists:drivers,id',
            'mileage' => 'nullable|integer|min:0',
            'technical_visit_expiry' => 'nullable|date',
            'insurance_expiry' => 'nullable|date',
            'status' => 'nullable|string',
        ]);

        $vehicle = Vehicle::create($validated);
        return response()->json($vehicle->load(['warehouse', 'driver']), 201);
    }
}
