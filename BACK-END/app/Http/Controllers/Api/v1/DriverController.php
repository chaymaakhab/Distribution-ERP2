<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request)
    {
        $query = Driver::with('warehouse:id,code,name,city')->orderBy('id', 'desc');

        if ($request->filled('type') && $request->query('type') !== 'all') {
            $query->where('driver_type', $request->query('type'));
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        $drivers = $query->get();

        return response()->json($drivers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'cin' => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:50',
            'driver_type' => 'required|string|in:depot_to_client,depot_to_depot,pre_seller',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'assigned_route' => 'nullable|string|max:255',
            'vehicle_model' => 'nullable|string|max:255',
            'vehicle_plate' => 'required|string|max:50',
            'capacity' => 'nullable|string|max:100',
        ]);

        $driver = Driver::create(array_merge($validated, [
            'status' => 'disponible',
        ]));

        $driver->load('warehouse:id,code,name,city');

        return response()->json($driver, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:disponible,en_tournee,en_transit,en_repos',
            'current_mission' => 'nullable|string',
        ]);

        $driver->update($validated);

        return response()->json($driver);
    }

    public function updateLocation(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);

        $validated = $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'speed_kmh' => 'nullable|integer|min:0',
        ]);

        $driver->update([
            'lat' => $validated['lat'],
            'lng' => $validated['lng'],
            'speed_kmh' => $validated['speed_kmh'] ?? 0,
            'last_location_at' => now(),
        ]);

        return response()->json([
            'message' => 'Coordonnées GPS mises à jour.',
            'driver' => $driver,
        ]);
    }
}
